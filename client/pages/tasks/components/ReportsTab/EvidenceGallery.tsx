import React, { useState } from "react";
import { TaskEvidenceSubmission } from "../../../../lib/supabase";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";

interface EvidenceGalleryProps {
  evidenceSubmissions: TaskEvidenceSubmission[];
}

const isPdfOrDocument = (filename?: string): boolean => {
  if (!filename) return false;
  const lowerName = filename.toLowerCase();
  return lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx');
};

const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({ evidenceSubmissions }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedEvidence = selectedIndex !== null ? evidenceSubmissions[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < evidenceSubmissions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  // Separate evidence by type for better organization
  const images = evidenceSubmissions.filter((e) => e.attachments?.file_type === "image");
  const videos = evidenceSubmissions.filter((e) => e.attachments?.file_type === "video");
  const documents = evidenceSubmissions.filter((e) => e.attachments?.file_type !== "image" && e.attachments?.file_type !== "video");

  return (
    <>
      {/* Gallery Grid */}
      <div className="space-y-8">
        {/* Images Section */}
        {images.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-sheraton-navy mb-4">📷 Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((evidence, idx) => {
                const globalIdx = evidenceSubmissions.indexOf(evidence);
                return (
                  <div
                    key={evidence.id}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedIndex(globalIdx)}
                  >
                    <img
                      src={evidence.attachments?.b2_url}
                      alt={evidence.description || "Photo"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-sheraton-navy mb-4">🎥 Videos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((evidence) => {
                const globalIdx = evidenceSubmissions.indexOf(evidence);
                return (
                  <div
                    key={evidence.id}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-black cursor-pointer hover:shadow-lg transition-shadow relative group"
                    onClick={() => setSelectedIndex(globalIdx)}
                  >
                    <video
                      src={evidence.attachments?.b2_url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-10 border-t-sheraton-navy ml-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {documents.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-sheraton-navy mb-4">📄 Documents</h4>
            <div className="space-y-2">
              {documents.map((evidence, idx) => {
                const globalIdx = evidenceSubmissions.indexOf(evidence);
                return (
                  <div
                    key={evidence.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedIndex(globalIdx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">📎</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {evidence.attachments?.original_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(evidence.attachments?.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {evidence.description && (
                        <p className="text-sm text-gray-600 ml-2">{evidence.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full-Page Viewer */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">
                {selectedEvidence.evidence_type.toUpperCase()}
              </p>
              {selectedEvidence.description && (
                <p className="text-sm text-gray-400">{selectedEvidence.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm mr-4">
                {selectedIndex! + 1} / {evidenceSubmissions.length}
              </span>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
            {selectedEvidence.attachments?.file_type === "image" ? (
              <img
                src={selectedEvidence.attachments.b2_url}
                alt={selectedEvidence.description || "Evidence"}
                className="max-w-full max-h-full object-contain"
              />
            ) : selectedEvidence.attachments?.file_type === "video" ? (
              <video
                src={selectedEvidence.attachments.b2_url}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {isPdfOrDocument(selectedEvidence.attachments?.original_name) ? (
                  <>
                    <iframe
                      src={`${selectedEvidence.attachments?.b2_url}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={selectedEvidence.attachments?.original_name}
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded">
                      <a
                        href={selectedEvidence.attachments?.b2_url}
                        download
                        className="inline-flex items-center gap-2 text-sheraton-gold hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-white text-lg mb-2">
                      {selectedEvidence.attachments?.original_name}
                    </p>
                    <p className="text-gray-400 mb-6">
                      {(selectedEvidence.attachments?.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <a
                      href={selectedEvidence.attachments?.b2_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-sheraton-gold text-sheraton-navy rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="bg-black border-t border-gray-700 p-4 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={selectedIndex === 0}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="flex-1 text-center">
              <p className="text-gray-400 text-sm">
                Submitted: {new Date(selectedEvidence.submitted_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={selectedIndex === evidenceSubmissions.length - 1}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EvidenceGallery;
