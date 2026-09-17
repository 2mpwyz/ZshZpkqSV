import React, { useState } from "react";
import {
  FileText,
  Image,
  Music,
  Video,
  Archive,
  File,
  Download,
  X,
  Paperclip,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import MuxVideoPlayer from "./MuxVideoPlayer";

interface Attachment {
  id?: string;
  attachmentId?: string; // Used by UploadedFile
  name?: string;
  originalName?: string; // Used by UploadedFile
  filename?: string; // Used by UploadedFile (for video uploads)
  type?: string;
  fileType?: string; // Used by UploadedFile
  size?: number;
  fileSize?: number; // Used by UploadedFile
  url?: string;
  publicUrl?: string; // Used by UploadedFile
}

interface AttachmentListProps {
  attachments: Attachment[];
  compact?: boolean;
}

// Get icon based on file extension or fileType
const getFileIcon = (fileName: string, fileType?: string) => {
  // Use fileType if provided
  if (fileType) {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'file':
      default:
        break;
    }
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Document types
  if (["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    return <FileText className="h-4 w-4" />;
  }

  // Image types
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return <Image className="h-4 w-4" />;
  }

  // Video types
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) {
    return <Video className="h-4 w-4" />;
  }

  // Audio types
  if (["mp3", "wav", "aac", "flac", "m4a"].includes(ext)) {
    return <Music className="h-4 w-4" />;
  }

  // Archive types
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <Archive className="h-4 w-4" />;
  }

  // Default
  return <File className="h-4 w-4" />;
};

// Format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

// Get file extension for display
const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toUpperCase() || "FILE";
};

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Separate videos from other attachments
  const videos = attachments.filter(att => {
    const fileType = att.fileType || att.type;
    return fileType === 'video';
  });

  const otherAttachments = attachments.filter(att => {
    const fileType = att.fileType || att.type;
    return fileType !== 'video';
  });

  const getFileNameFromAttachment = (attachment: Attachment): string => {
    return attachment.originalName || attachment.name || "Attachment";
  };

  const getFileSizeFromAttachment = (attachment: Attachment): number | undefined => {
    return attachment.fileSize || attachment.size;
  };

  const getFileUrlFromAttachment = (attachment: Attachment): string => {
    return attachment.publicUrl || attachment.url || "";
  };

  const getFileTypeFromAttachment = (attachment: Attachment): string | undefined => {
    return attachment.fileType || attachment.type;
  };

  const handleDownload = (attachment: Attachment) => {
    const url = getFileUrlFromAttachment(attachment);
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileNameFromAttachment(attachment);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Videos section */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((attachment) => {
              const fileName = getFileNameFromAttachment(attachment);
              const fileUrl = getFileUrlFromAttachment(attachment);
              const videoFilename = attachment.filename || '';
              return (
                <div key={videoFilename} className="w-full">
                  <p className="text-xs font-medium text-gray-600 mb-2">{fileName}</p>
                  {videoFilename && <MuxVideoPlayer filename={videoFilename} b2Url={fileUrl} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Other attachments button */}
        {otherAttachments.length > 0 && (
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <Paperclip className="h-3 w-3" />
              {otherAttachments.length} file{otherAttachments.length !== 1 ? "s" : ""}
            </button>

            {expanded && (
              <div className="absolute z-50 top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-900">Attachments</h4>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {otherAttachments.map((attachment) => {
                  const fileName = getFileNameFromAttachment(attachment);
                  const fileSize = getFileSizeFromAttachment(attachment);
                  const fileType = getFileTypeFromAttachment(attachment);
                  return (
                    <div
                      key={attachment.id || attachment.attachmentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-gray-500">
                          {getFileIcon(fileName, fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileName}
                          </p>
                          {fileSize && (
                            <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(attachment)}
                        className="flex-shrink-0 text-gray-500 hover:text-gray-900"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Videos section */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videos.length})
          </h4>
          <div className="space-y-2">
            {videos.map((attachment) => {
              const fileName = getFileNameFromAttachment(attachment);
              const fileUrl = getFileUrlFromAttachment(attachment);
              const videoFilename = attachment.filename || '';
              return (
                <div key={videoFilename} className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">{fileName}</p>
                  {videoFilename && <MuxVideoPlayer filename={videoFilename} b2Url={fileUrl} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other attachments section */}
      {otherAttachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Files ({otherAttachments.length})
            </h4>
            {otherAttachments.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {expanded ? "Hide" : "Show"}
              </button>
            )}
          </div>

          {(expanded || otherAttachments.length <= 3) && (
            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              {otherAttachments.map((attachment) => {
                const fileName = getFileNameFromAttachment(attachment);
                const fileSize = getFileSizeFromAttachment(attachment);
                const fileType = getFileTypeFromAttachment(attachment);
                return (
                  <div
                    key={attachment.id || attachment.attachmentId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-blue-100 text-blue-600 rounded">
                        {getFileIcon(fileName, fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getFileExtension(fileName)}
                          </Badge>
                          {fileSize && (
                            <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(attachment)}
                      className="flex-shrink-0 ml-2"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {!expanded && otherAttachments.length > 3 && (
            <div className="flex flex-wrap gap-2">
              {otherAttachments.slice(0, 3).map((attachment) => {
                const fileName = getFileNameFromAttachment(attachment);
                const fileType = getFileTypeFromAttachment(attachment);
                return (
                  <Badge key={attachment.id || attachment.attachmentId} variant="outline" className="text-xs">
                    {getFileIcon(fileName, fileType)}
                    <span className="ml-1">{fileName.length > 20 ? fileName.substring(0, 20) + "..." : fileName}</span>
                  </Badge>
                );
              })}
              {otherAttachments.length > 3 && (
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100" onClick={() => setExpanded(true)}>
                  +{otherAttachments.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttachmentList;
