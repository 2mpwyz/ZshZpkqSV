import React, { useState } from "react";
import { Upload, Loader } from "lucide-react";

interface EvidenceUploadZoneProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
}

export interface FileAttachment {
  name: string;
  type: "image" | "video" | "document";
  size: number;
  file: File;
}

const EvidenceUploadZone: React.FC<EvidenceUploadZoneProps> = ({
  onFilesSelected,
  isUploading = false,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const files: FileAttachment[] = [];

    Array.from(fileList).slice(0, maxFiles).forEach((file) => {
      let type: "image" | "video" | "document" = "document";

      if (file.type.startsWith("image")) type = "image";
      else if (file.type.startsWith("video")) type = "video";

      files.push({
        name: file.name,
        type,
        size: file.size,
        file,
      });
    });

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
        isDragging
          ? "border-sheraton-gold bg-sheraton-gold bg-opacity-5"
          : "border-gray-300 bg-gray-50 hover:border-sheraton-gold"
      } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input
        type="file"
        id="evidence-upload"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
        disabled={isUploading}
      />

      <label htmlFor="evidence-upload" className="flex flex-col items-center">
        {isUploading ? (
          <>
            <Loader className="h-8 w-8 text-sheraton-gold mb-2 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-sheraton-gold mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Drag files here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Images, videos, documents (max {maxFiles} files)
            </p>
          </>
        )}
      </label>
    </div>
  );
};

export default EvidenceUploadZone;
