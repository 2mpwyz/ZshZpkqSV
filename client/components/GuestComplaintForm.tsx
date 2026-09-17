import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useFileUpload, UploadedFile } from "../hooks/useFileUpload";
import VoiceRecorder from "./VoiceRecorder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  AlertCircle,
  Upload,
  X,
  CheckCircle,
  Send,
  Loader,
} from "lucide-react";

interface ComplaintAttachment {
  id: string;
  name: string;
  type: "image" | "video" | "file" | "audio";
  size: number;
}

interface GuestComplaint {
  guestName: string;
  email: string;
  roomNumber: string;
  complaintType: string;
  description: string;
  priority: string;
  attachments: ComplaintAttachment[];
}

interface GuestComplaintFormProps {
  onComplaintSubmitted?: (complaint: GuestComplaint) => void;
  triggerButtonText?: string;
}

const GuestComplaintForm: React.FC<GuestComplaintFormProps> = ({
  onComplaintSubmitted,
  triggerButtonText = "Report an Issue",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadMultipleFiles, linkToComplaint } = useFileUpload();
  const [complaint, setComplaint] = useState<GuestComplaint>({
    guestName: "",
    email: "",
    roomNumber: "",
    complaintType: "",
    description: "",
    priority: "medium",
    attachments: [],
  });

  const complaintTypes = [
    "Maintenance Issue",
    "Cleanliness",
    "Noise/Disturbance",
    "Temperature Control",
    "Service Quality",
    "Missing Items",
    "Facility Damage",
    "Safety Concern",
    "Other",
  ];

  const handleAddAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const filesToUpload = Array.from(files);
      const uploaded = await uploadMultipleFiles(filesToUpload, 'complaints');

      if (uploaded && uploaded.length > 0) {
        setUploadedFiles((prev) => [...prev, ...uploaded]);

        // Update complaint attachments metadata for display
        uploaded.forEach((file) => {
          const newAttachment: ComplaintAttachment = {
            id: file.attachmentId,
            name: file.originalName,
            type: file.fileType,
            size: file.fileSize,
          };
          setComplaint((prev) => ({
            ...prev,
            attachments: [...prev.attachments, newAttachment],
          }));
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    // Remove from uploaded files
    setUploadedFiles((prev) => prev.filter((f) => f.attachmentId !== id));
    // Remove from display
    setComplaint((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  };

  const handleVoiceRecordingComplete = async (audioFile: File) => {
    setIsUploading(true);
    try {
      const uploaded = await uploadMultipleFiles([audioFile], 'complaints');

      if (uploaded && uploaded.length > 0) {
        setUploadedFiles((prev) => [...prev, ...uploaded]);

        // Update complaint attachments metadata for display
        uploaded.forEach((file) => {
          const newAttachment: ComplaintAttachment = {
            id: file.attachmentId,
            name: file.originalName,
            type: "audio",
            size: file.fileSize,
          };
          setComplaint((prev) => ({
            ...prev,
            attachments: [...prev.attachments, newAttachment],
          }));
        });
      }
    } catch (error) {
      console.error("Error uploading voice note:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to upload voice note"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !complaint.guestName.trim() ||
      !complaint.email.trim() ||
      !complaint.roomNumber.trim() ||
      !complaint.complaintType ||
      !complaint.description.trim()
    ) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get current user (if authenticated)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert complaint into database (without attachment metadata - we'll link them separately)
      const { data: complaintData, error: insertError } = await supabase
        .from("complaints")
        .insert([
          {
            user_id: user?.id || null,
            guest_name: complaint.guestName,
            email: complaint.email,
            room_number: complaint.roomNumber,
            complaint_type: complaint.complaintType,
            description: complaint.description,
            priority: complaint.priority,
            status: "open",
            attachments: [], // Empty array - attachments linked via complaint_attachments table
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Link uploaded files to the complaint
      if (complaintData && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const success = await linkToComplaint(file.attachmentId, complaintData.id);
          if (!success) {
            console.warn(`Failed to link attachment ${file.attachmentId} to complaint`);
          }
        }
      }

      console.log("Complaint submitted to database with", uploadedFiles.length, "attachments");

      // Show success screen
      setIsSubmitted(true);

      // Call callback if provided
      if (onComplaintSubmitted) {
        onComplaintSubmitted(complaint);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        setComplaint({
          guestName: "",
          email: "",
          roomNumber: "",
          complaintType: "",
          description: "",
          priority: "medium",
          attachments: [],
        });
        setUploadedFiles([]);
      }, 3000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Information */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-sheraton-navy">Your Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={complaint.guestName}
                    onChange={(e) =>
                      setComplaint((prev) => ({
                        ...prev,
                        guestName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={complaint.email}
                    onChange={(e) =>
                      setComplaint((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room">Room Number *</Label>
                  <Input
                    id="room"
                    placeholder="e.g., 301"
                    value={complaint.roomNumber}
                    onChange={(e) =>
                      setComplaint((prev) => ({
                        ...prev,
                        roomNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={complaint.priority}
                    onValueChange={(value) =>
                      setComplaint((prev) => ({
                        ...prev,
                        priority: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-sheraton-navy">Complaint Details</h3>

              <div className="space-y-2">
                <Label htmlFor="type">Issue Type *</Label>
                <Select
                  value={complaint.complaintType}
                  onValueChange={(value) =>
                    setComplaint((prev) => ({
                      ...prev,
                      complaintType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  value={complaint.description}
                  onChange={(e) =>
                    setComplaint((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-emerald-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-sheraton-navy">
                Additional Evidence (Optional)
              </h3>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload Photos/Videos</Label>
                <div className={`border-2 border-dashed border-emerald-300 rounded-lg p-4 ${isUploading ? "opacity-75" : ""}`}>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleAddAttachment}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center ${isUploading ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isUploading ? (
                      <>
                        <Loader className="h-8 w-8 text-emerald-600 mb-2 animate-spin" />
                        <p className="text-sm font-medium text-emerald-900">
                          Uploading...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-emerald-600 mb-2" />
                        <p className="text-sm font-medium text-emerald-900">
                          Click to upload photos or videos
                        </p>
                        <p className="text-xs text-emerald-700">
                          PNG, JPG, MP4, MOV up to 50MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Voice Note */}
              <div className="space-y-2">
                <Label>Voice Note (Optional)</Label>
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecordingComplete}
                  disabled={isUploading || isSubmitting}
                />
              </div>

              {/* Attachment List */}
              {complaint.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Attached Files</Label>
                  <div className="space-y-2">
                    {complaint.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-2 bg-white border rounded"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {attachment.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {attachment.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="sheraton-gradient text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Success Screen
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-sheraton-navy">
                Thank You!
              </h3>
              <p className="text-muted-foreground">
                Your complaint has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                A manager has been notified and will address your issue shortly.
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 mt-4">
              Ticket ID: #{Date.now().toString().slice(-6)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-4">
              This dialog will close automatically...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuestComplaintForm;
