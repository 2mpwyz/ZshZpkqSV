import { useState, useCallback } from 'react';
import { uploadFileWithMetadata } from '../lib/b2Upload';
import { supabase } from '../lib/supabase';

export interface FileUploadState {
  isUploading: boolean;
  error: string | null;
  progress: number;
  attachmentId: string | null;
  publicUrl: string | null;
}

export interface UploadedFile {
  attachmentId: string;
  publicUrl: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video' | 'file' | 'audio';
}

/**
 * Hook for managing file uploads to B2 with metadata tracking
 */
export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    error: null,
    progress: 0,
    attachmentId: null,
    publicUrl: null,
  });

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      error: null,
      progress: 0,
      attachmentId: null,
      publicUrl: null,
    });
  }, []);

  /**
   * Upload a single file
   * @param file - The file to upload
   * @param folderPath - Folder path in B2 (e.g., 'tasks', 'complaints')
   * @returns The uploaded file details
   */
  const uploadFile = useCallback(
    async (
      file: File,
      folderPath: string = 'uploads'
    ): Promise<UploadedFile | null> => {
      resetState();

      try {
        setState((prev) => ({ ...prev, isUploading: true, error: null }));

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        setState((prev) => ({ ...prev, progress: 10 }));

        // Upload file with metadata
        const result = await uploadFileWithMetadata(file, folderPath, user.id);

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.attachmentId) {
          throw new Error('Failed to create attachment record');
        }

        // Fetch the created attachment for complete details
        const { data: attachmentData, error: fetchError } = await supabase
          .from('attachments')
          .select('*')
          .eq('id', result.attachmentId)
          .single();

        if (fetchError || !attachmentData) {
          throw new Error('Failed to retrieve attachment details');
        }

        setState((prev) => ({
          ...prev,
          isUploading: false,
          attachmentId: result.attachmentId,
          publicUrl: result.publicUrl,
          progress: 100,
        }));

        return {
          attachmentId: result.attachmentId,
          publicUrl: result.publicUrl,
          filename: attachmentData.filename,
          originalName: attachmentData.original_name,
          fileSize: attachmentData.file_size,
          mimeType: attachmentData.mime_type,
          fileType: attachmentData.file_type,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [resetState]
  );

  /**
   * Upload multiple files
   */
  const uploadMultipleFiles = useCallback(
    async (
      files: File[],
      folderPath: string = 'uploads'
    ): Promise<UploadedFile[]> => {
      const uploadedFiles: UploadedFile[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        setState((prev) => ({
          ...prev,
          progress: Math.round((i / totalFiles) * 100),
        }));

        const uploaded = await uploadFile(files[i], folderPath);
        if (uploaded) {
          uploadedFiles.push(uploaded);
        }
      }

      setState((prev) => ({
        ...prev,
        progress: 100,
      }));

      return uploadedFiles;
    },
    [uploadFile]
  );

  /**
   * Link an uploaded attachment to a task
   */
  const linkToTask = useCallback(
    async (attachmentId: string, taskId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('task_attachments')
          .insert({
            task_id: taskId,
            attachment_id: attachmentId,
          });

        if (error) {
          console.error(`[linkToTask] Failed to create junction record:`, {
            taskId,
            attachmentId,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });

          // Specific error context
          if (error.code === '23503') {
            console.error(
              `[linkToTask] Foreign key constraint violation - verify that:`,
              { taskId, attachmentId, checkIssue: 'taskId or attachmentId does not exist in their respective tables' }
            );
          } else if (error.code === '23505') {
            console.warn(`[linkToTask] Duplicate junction record (attachment already linked to task)`, { taskId, attachmentId });
          }

          return false;
        }

        return true;
      } catch (error) {
        console.error(`[linkToTask] Unexpected error:`, { taskId, attachmentId, error });
        return false;
      }
    },
    []
  );

  /**
   * Link an uploaded attachment to a complaint
   */
  const linkToComplaint = useCallback(
    async (attachmentId: string, complaintId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('complaint_attachments')
          .insert({
            complaint_id: complaintId,
            attachment_id: attachmentId,
          });

        if (error) {
          console.error(`[linkToComplaint] Failed to create junction record:`, {
            complaintId,
            attachmentId,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });

          // Specific error context
          if (error.code === '23503') {
            console.error(
              `[linkToComplaint] Foreign key constraint violation - verify that:`,
              { complaintId, attachmentId, checkIssue: 'complaintId or attachmentId does not exist in their respective tables' }
            );
          } else if (error.code === '23505') {
            console.warn(`[linkToComplaint] Duplicate junction record (attachment already linked to complaint)`, { complaintId, attachmentId });
          }

          return false;
        }

        return true;
      } catch (error) {
        console.error(`[linkToComplaint] Unexpected error:`, { complaintId, attachmentId, error });
        return false;
      }
    },
    []
  );

  /**
   * Get all attachments for a task
   */
  const getTaskAttachments = useCallback(
    async (taskId: string): Promise<UploadedFile[]> => {
      try {
        const { data, error } = await supabase
          .from('task_attachments')
          .select(`
            attachment_id,
            attachments (
              id,
              filename,
              original_name,
              file_size,
              mime_type,
              file_type,
              b2_url
            )
          `)
          .eq('task_id', taskId);

        if (error) {
          return [];
        }

        if (!data) {
          return [];
        }

        const attachments = data
          .map((row: any) => {
            // Check if relationship was resolved
            if (!row.attachments) {
              return null;
            }

            const att = row.attachments;

            // Validate required fields
            if (!att.id || !att.b2_url) {
              return null;
            }

            return {
              attachmentId: att.id,
              publicUrl: att.b2_url,
              filename: att.filename || '',
              originalName: att.original_name || '',
              fileSize: att.file_size || 0,
              mimeType: att.mime_type || 'application/octet-stream',
              fileType: att.file_type || 'file',
            };
          })
          .filter((att) => att !== null);

        return attachments;
      } catch (error) {
        return [];
      }
    },
    []
  );

  /**
   * Get all attachments for a complaint
   */
  const getComplaintAttachments = useCallback(
    async (complaintId: string): Promise<UploadedFile[]> => {
      try {
        const { data, error } = await supabase
          .from('complaint_attachments')
          .select(`
            attachment_id,
            attachments (
              id,
              filename,
              original_name,
              file_size,
              mime_type,
              file_type,
              b2_url
            )
          `)
          .eq('complaint_id', complaintId);

        if (error) {
          return [];
        }

        if (!data) {
          return [];
        }

        const attachments = data
          .map((row: any) => {
            // Check if relationship was resolved
            if (!row.attachments) {
              return null;
            }

            const att = row.attachments;

            // Validate required fields
            if (!att.id || !att.b2_url) {
              return null;
            }

            return {
              attachmentId: att.id,
              publicUrl: att.b2_url,
              filename: att.filename || '',
              originalName: att.original_name || '',
              fileSize: att.file_size || 0,
              mimeType: att.mime_type || 'application/octet-stream',
              fileType: att.file_type || 'file',
            };
          })
          .filter((att) => att !== null);

        return attachments;
      } catch (error) {
        return [];
      }
    },
    []
  );

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    linkToTask,
    linkToComplaint,
    getTaskAttachments,
    getComplaintAttachments,
    resetState,
  };
}
