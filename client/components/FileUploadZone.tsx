import React, { useState, useCallback } from "react";
import { Upload, X, File, Image, Video, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useFileUpload, UploadedFile } from "../hooks/useFileUpload";
import { toast } from "../hooks/use-toast";

export interface FileAttachment extends UploadedFile {
  // Extends UploadedFile with additional UI properties
}

interface FileUploadZoneProps {
  attachments: FileAttachment[];
  onAddAttachments: (files: FileAttachment[]) => void;
  onRemoveAttachment: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  folderPath?: string; // B2 folder path (e.g., 'tasks', 'complaints')
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  maxFiles = 10,
  maxSizeMB = 50,
  folderPath = 'uploads',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  const { uploadMultipleFiles, isUploading, progress, error: uploadError } = useFileUpload();

  const getFileIcon = (fileType: 'image' | 'video' | 'file' | 'audio') => {
    switch (fileType) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const determineFileType = (mimeType: string): 'image' | 'video' | 'file' | 'audio' => {
    if (mimeType.startsWith("image")) return "image";
    if (mimeType.startsWith("video")) return "video";
    if (mimeType.startsWith("audio")) return "audio";
    return "file";
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null);

      if (attachments.length + files.length > maxFiles) {
        const msg = `Maximum ${maxFiles} files allowed`;
        setError(msg);
        toast({
          title: "Upload Error",
          description: msg,
          variant: "destructive",
        });
        return;
      }

      // Validate file sizes
      const filesToUpload: File[] = [];
      Array.from(files).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          const msg = `File "${file.name}" exceeds ${maxSizeMB}MB limit`;
          setError(msg);
          toast({
            title: "File Too Large",
            description: msg,
            variant: "destructive",
          });
          return;
        }
        filesToUpload.push(file);
      });

      if (filesToUpload.length === 0) return;

      // Upload files
      const fileIds = filesToUpload.map((f) => f.name);
      setUploadingFiles(new Set(fileIds));

      try {
        const uploadedFiles = await uploadMultipleFiles(filesToUpload, folderPath);

        if (uploadedFiles.length === 0) {
          throw new Error(uploadError || "Failed to upload files");
        }

        // Convert to FileAttachment format
        const attachmentsToAdd: FileAttachment[] = uploadedFiles.map((file) => ({
          ...file,
        }));

        onAddAttachments(attachmentsToAdd);

        toast({
          title: "Success",
          description: `${uploadedFiles.length} file(s) uploaded successfully`,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setError(errorMsg);
        toast({
          title: "Upload Error",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles(new Set());
      }
    },
    [attachments.length, maxFiles, maxSizeMB, uploadMultipleFiles, onAddAttachments, uploadError, folderPath]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemove = async (attachmentId: string) => {
    // Note: Actual deletion from B2 should be handled separately
    // For now, just remove from local state
    onRemoveAttachment(attachmentId);
    toast({
      title: "Removed",
      description: "Attachment removed from this task",
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        } ${isUploading ? "opacity-75" : ""}`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          disabled={isUploading}
        />
        <label 
          htmlFor="file-upload" 
          className={`flex flex-col items-center cursor-pointer ${isUploading ? "pointer-events-none" : ""}`}
        >
          {isUploading ? (
            <>
              <Loader className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
              <p className="text-sm font-medium text-gray-700">
                Uploading... {progress}%
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Drag files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images, videos, and documents up to {maxSizeMB}MB
              </p>
            </>
          )}
        </label>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Attached Files ({attachments.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.attachmentId}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-gray-400">
                    {getFileIcon(attachment.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                    {attachment.fileType}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(attachment.attachmentId)}
                  className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
