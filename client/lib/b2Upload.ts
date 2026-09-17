import { supabase } from './supabase';

/**
 * Validate that a URL is properly formatted and doesn't contain undefined/null
 */
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload result from B2
 */
export interface UploadResult {
  publicUrl: string;
  filename: string;
  fileId?: string;
  error: string | null;
}

/**
 * Upload a file to Backblaze B2 via Supabase Edge Function
 * Replaces supabase.storage with B2
 * 
 * @param file - The file to upload
 * @param folderPath - The folder path in B2 (e.g., 'tasks', 'complaints', 'uploads')
 * @returns Upload result with public URL or error
 */
export async function uploadToB2(
  file: File,
  folderPath: string
): Promise<UploadResult> {
  try {
    const filename = `${folderPath}/${Date.now()}-${file.name}`;
    const contentType = file.type || 'application/octet-stream';

    // Upload file via Edge Function (server-side, no CORS issues)
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('filename', filename);
    uploadFormData.append('contentType', contentType);

    const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
      'upload-to-b2',
      {
        body: uploadFormData,
      }
    );

    if (uploadError) {
      return {
        publicUrl: '',
        filename: '',
        error: uploadError?.message || 'Failed to upload file to B2',
      };
    }

    if (!uploadData?.publicUrl) {
      return {
        publicUrl: '',
        filename: '',
        error: 'No URL returned from upload. Please check server configuration.',
      };
    }

    // Validate the returned URL
    const publicUrl = uploadData.publicUrl as string;
    if (!isValidUrl(publicUrl)) {
      console.error('Invalid URL returned from B2 upload:', publicUrl);
      return {
        publicUrl: '',
        filename: '',
        error: `Invalid URL returned from server: ${publicUrl}. Please check B2 configuration.`,
      };
    }

    return {
      publicUrl,
      filename,
      fileId: uploadData.fileId,
      error: null,
    };
  } catch (err) {
    return {
      publicUrl: '',
      filename: '',
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Trigger Mux processing for a video file already uploaded to B2
 *
 * @param filename - The filename in B2 (from B2 upload result)
 * @param userId - The user ID
 * @returns The Mux asset data or error
 */
async function processVideoWithMux(
  filename: string,
  userId: string
): Promise<{ assetId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('process-new-video', {
      body: { filename, userId },
    });

    if (error) {
      console.error('Error triggering video processing:', error);
      return {
        error: error?.message || 'Failed to trigger Mux processing',
      };
    }

    return {
      assetId: data?.data?.id,
    };
  } catch (err) {
    console.error('Error calling process-new-video:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to process video',
    };
  }
}

/**
 * Upload a file to B2 and store metadata in database
 * For videos, also triggers Mux processing
 *
 * @param file - The file to upload
 * @param folderPath - The folder path in B2
 * @param userId - The user ID for the attachment record
 * @returns The attachment ID and public URL
 */
export async function uploadFileWithMetadata(
  file: File,
  folderPath: string,
  userId: string
): Promise<{ attachmentId: string | null; publicUrl: string; error: string | null }> {
  try {
    // Step 1: Upload file to B2
    const uploadResult = await uploadToB2(file, folderPath);

    if (uploadResult.error) {
      return {
        attachmentId: null,
        publicUrl: '',
        error: uploadResult.error,
      };
    }

    // Step 2: Determine file type
    let fileType: 'image' | 'video' | 'file' | 'audio' = 'file';
    if (file.type.startsWith('image')) {
      fileType = 'image';
    } else if (file.type.startsWith('video')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio')) {
      fileType = 'audio';
    }

    // Step 3: Store metadata in database
    const { data: attachmentData, error: dbError } = await supabase
      .from('attachments')
      .insert({
        user_id: userId,
        filename: uploadResult.filename,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
        b2_url: uploadResult.publicUrl,
        b2_file_id: uploadResult.fileId,
        file_type: fileType,
        is_public: true,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Failed to store attachment metadata:', dbError);
      return {
        attachmentId: null,
        publicUrl: uploadResult.publicUrl,
        error: `File uploaded but failed to record metadata: ${dbError.message}`,
      };
    }

    // Step 4: If it's a video, trigger Mux processing
    if (fileType === 'video' && attachmentData?.id) {
      const muxResult = await processVideoWithMux(uploadResult.filename, userId);
      if (muxResult.error) {
        // Don't fail the upload - the attachment is still created and can be played from B2
      }
    }

    return {
      attachmentId: attachmentData?.id || null,
      publicUrl: uploadResult.publicUrl,
      error: null,
    };
  } catch (err) {
    return {
      attachmentId: null,
      publicUrl: '',
      error: err instanceof Error ? err.message : 'Upload with metadata failed',
    };
  }
}

/**
 * Get a B2 file URL from a stored filename
 */
export function getB2FileUrl(filename: string): string {
  const baseUrl = import.meta.env.VITE_B2_PUBLIC_URL;
  if (!baseUrl) {
    console.error('VITE_B2_PUBLIC_URL is not set');
    return '';
  }
  return `${baseUrl}/${filename}`;
}

/**
 * Delete a file from B2 via Edge Function
 * Note: Requires appropriate Edge Function implementation
 */
export async function deleteFromB2(
  filename: string,
  fileId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error: deleteError } = await supabase.functions.invoke(
      'delete-from-b2',
      {
        body: { filename, fileId },
      }
    );

    if (deleteError) {
      return {
        success: false,
        error: deleteError?.message || 'Failed to delete file from B2',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Delete failed',
    };
  }
}

/**
 * Delete attachment record and file from B2
 */
export async function deleteAttachment(attachmentId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    // Get attachment details
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('filename, b2_file_id, b2_url')
      .eq('id', attachmentId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: `Failed to fetch attachment: ${fetchError.message}`,
      };
    }

    // Delete from B2
    if (attachment) {
      const deleteResult = await deleteFromB2(attachment.filename, attachment.b2_file_id);
      if (!deleteResult.success) {
        console.warn('Failed to delete file from B2, continuing with DB delete:', deleteResult.error);
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      return {
        success: false,
        error: `Failed to delete attachment record: ${dbError.message}`,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Delete attachment failed',
    };
  }
}
