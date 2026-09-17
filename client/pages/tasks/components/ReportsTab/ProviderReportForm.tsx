import React, { useState } from "react";
import { supabase, Task as TaskType, UserProfile, TaskReport, TaskChecklist, TaskChecklistItem, TaskReportChecklistItem, TaskEvidenceSubmission, TaskIssue, TaskEvidenceRequirement } from "../../../../lib/supabase";
import { toast } from "../../../../hooks/use-toast";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import EvidenceUploadZone, { FileAttachment } from "../../../../components/EvidenceUploadZone";

interface ProviderReportFormProps {
  task: TaskType;
  taskReport: TaskReport | null;
  checklist: TaskChecklist | null;
  checklistItems: TaskChecklistItem[];
  reportChecklistItems: TaskReportChecklistItem[];
  evidenceSubmissions: TaskEvidenceSubmission[];
  evidenceRequirements: TaskEvidenceRequirement | null;
  issues: TaskIssue[];
  currentUser: any;
  currentUserProfile: UserProfile | null;
  onReportUpdated: () => void;
}

const ProviderReportForm: React.FC<ProviderReportFormProps> = ({
  task,
  taskReport,
  checklist,
  checklistItems,
  reportChecklistItems,
  evidenceSubmissions,
  evidenceRequirements,
  issues,
  currentUser,
  currentUserProfile,
  onReportUpdated,
}) => {
  const { uploadFile, uploadMultipleFiles } = useFileUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(taskReport?.description || "");
  const [percentage, setPercentage] = useState(taskReport?.percentage_complete || 0);
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(reportChecklistItems.filter((item) => item.is_completed).map((item) => item.checklist_item_id))
  );
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [evidenceType, setEvidenceType] = useState<"photo" | "video" | "document" | "signature">("photo");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<FileAttachment[]>([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueSeverity, setIssueSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");

  const handleChecklistToggle = async (itemId: string) => {
    if (!taskReport) {
      toast({
        title: "Error",
        description: "Please save the progress report first before updating checklist",
        variant: "destructive",
      });
      return;
    }

    const newCompleted = new Set(completedItems);
    const isCurrentlyCompleted = newCompleted.has(itemId);

    try {
      if (isCurrentlyCompleted) {
        newCompleted.delete(itemId);
        // Delete from database
        await supabase
          .from("task_report_checklist_items")
          .delete()
          .eq("report_id", taskReport.id)
          .eq("checklist_item_id", itemId);
      } else {
        newCompleted.add(itemId);
        // Insert into database
        await supabase
          .from("task_report_checklist_items")
          .insert({
            report_id: taskReport.id,
            checklist_item_id: itemId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });
      }

      setCompletedItems(newCompleted);
      toast({
        title: "Success",
        description: isCurrentlyCompleted ? "Item unchecked" : "Item checked",
      });
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast({
        title: "Error",
        description: "Failed to update checklist item",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!currentUserProfile) return;

    setIsSubmitting(true);
    try {
      if (taskReport) {
        // Update existing report
        const { error } = await supabase
          .from("task_reports")
          .update({
            description,
            percentage_complete: percentage,
            last_updated_by: currentUser.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskReport.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Progress report updated",
        });
      } else {
        // Create new report if it doesn't exist (fallback if trigger didn't fire)
        const { error, data } = await supabase
          .from("task_reports")
          .insert({
            task_id: task.id,
            provider_id: currentUserProfile.id,
            status: "in_progress",
            description,
            percentage_complete: percentage,
            last_updated_by: currentUser.id,
          })
          .select()
          .single();

        if (error) {
          // If still fails, provide helpful error message
          if (error.message.includes("foreign key") || error.message.includes("23503")) {
            throw new Error(
              "Unable to create report. Please ensure your user profile is properly linked. Try refreshing the page."
            );
          }
          throw error;
        }

        toast({
          title: "Success",
          description: "Progress report created",
        });
      }

      onReportUpdated();
    } catch (error) {
      console.error("Error submitting report:", error);
      let errorDesc = "Failed to submit report";

      if (error instanceof Error) {
        if (error.message.includes("foreign key") || error.message.includes("23503")) {
          errorDesc = "Data consistency issue. Please refresh and try again.";
        } else if (error.message.includes("profile")) {
          errorDesc = "User profile not properly linked. Please refresh the page.";
        } else {
          errorDesc = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelected = async (files: FileAttachment[]) => {
    if (!currentUserProfile || !task.id) {
      toast({
        title: "Error",
        description: "Unable to upload evidence at this time",
        variant: "destructive",
      });
      return;
    }

    setUploadingFiles(files);
    setIsSubmitting(true);

    try {
      // Upload all files (proper B2 upload with attachments table)
      const filesToUpload = files.map((f) => f.file);
      const uploadedFilesList = await uploadMultipleFiles(filesToUpload, "tasks");

      if (!uploadedFilesList || uploadedFilesList.length === 0) {
        throw new Error("Failed to upload files");
      }

      // Insert each uploaded file into task_evidence_submissions
      const insertPromises = uploadedFilesList.map((uploadedFile) =>
        supabase
          .from("task_evidence_submissions")
          .insert({
            task_id: task.id,
            provider_id: currentUserProfile.id,
            attachment_id: uploadedFile.attachmentId,
            evidence_type: evidenceType,
            description: evidenceDescription,
            submitted_at: new Date().toISOString(),
          })
      );

      const results = await Promise.all(insertPromises);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        throw new Error("Failed to save some evidence submissions");
      }

      toast({
        title: "Success",
        description: `${files.length} evidence file(s) uploaded`,
      });

      setShowEvidenceUpload(false);
      setEvidenceDescription("");
      setUploadingFiles([]);
      onReportUpdated();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      let errorDesc = "Failed to upload evidence";

      if (error instanceof Error) {
        if (error.message.includes("foreign key") || error.message.includes("23503")) {
          errorDesc = "Data issue. Please refresh and try again.";
        } else if (error.message.includes("profile")) {
          errorDesc = "User profile not linked. Please refresh the page.";
        } else {
          errorDesc = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRaiseIssue = async () => {
    if (!currentUserProfile || !issueTitle.trim()) {
      toast({
        title: "Error",
        description: "Issue title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase
        .from("task_issues")
        .insert({
          task_id: task.id,
          provider_id: currentUserProfile.id,
          title: issueTitle,
          description: issueDescription,
          severity: issueSeverity,
          status: "open",
        });

      toast({
        title: "Success",
        description: "Issue raised and task flagged",
      });

      setShowIssueForm(false);
      setIssueTitle("");
      setIssueDescription("");
      setIssueSeverity("medium");
      onReportUpdated();
    } catch (error) {
      console.error("Error raising issue:", error);
      let errorDesc = "Failed to raise issue";

      if (error instanceof Error) {
        if (error.message.includes("foreign key") || error.message.includes("23503")) {
          errorDesc = "Data issue. Please refresh and try again.";
        } else if (error.message.includes("profile")) {
          errorDesc = "User profile not linked. Please refresh the page.";
        }
      }

      toast({
        title: "Error",
        description: errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!taskReport) {
      toast({
        title: "Error",
        description: "Please save your progress report first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update report status to completed_pending_approval
      await supabase
        .from("task_reports")
        .update({
          status: "completed_pending_approval",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskReport.id);

      toast({
        title: "Success",
        description: "Report submitted for manager review",
      });

      onReportUpdated();
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast({
        title: "Error",
        description: "Failed to submit report for review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingEvidence = evidenceSubmissions.filter((e) => !e.approved_at);
  const approvedEvidence = evidenceSubmissions.filter((e) => e.approved_at);
  const openIssues = issues.filter((i) => i.status === "open");
  const isReportComplete = percentage >= 100;

  return (
    <div className="space-y-6">
      {/* Progress Report Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Progress Report</h3>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Description & Progress
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you've completed, what you're currently working on, and any notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sheraton-gold focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Percentage Complete */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Completion Percentage</label>
              <span className="text-lg font-semibold text-sheraton-gold">{percentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitReport}
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-sheraton-gold text-sheraton-navy rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Progress Report"}
          </button>
        </div>
      </div>

      {/* Checklist Section */}
      {checklist && checklistItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
            Task Checklist ({completedItems.size}/{checklistItems.length})
          </h3>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={completedItems.has(item.id)}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="mt-1 w-5 h-5 text-sheraton-gold rounded cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.label}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Section */}
      {evidenceRequirements && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-2">
            Evidence Required
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Types: {evidenceRequirements.required_evidence_types.join(", ")}
          </p>
          {evidenceRequirements.description && (
            <p className="text-sm text-gray-700 mb-4">{evidenceRequirements.description}</p>
          )}

          {/* Submitted Evidence */}
          {approvedEvidence.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-3">✓ Approved Evidence</p>
              <div className="space-y-3">
                {approvedEvidence.map((evidence: any) => (
                  <div key={evidence.id} className="bg-white p-3 rounded border border-gray-200">
                    <p className="font-medium text-gray-800">{evidence.evidence_type.toUpperCase()}</p>
                    {evidence.description && <p className="text-sm text-gray-600 mt-1">{evidence.description}</p>}

                    {/* Attachment preview */}
                    {evidence.attachments && (
                      <div className="mt-3 rounded overflow-hidden">
                        {evidence.attachments.file_type === 'image' ? (
                          <img
                            src={evidence.attachments.b2_url}
                            alt={evidence.attachments.original_name}
                            className="max-w-full max-h-64 rounded border border-gray-200"
                          />
                        ) : evidence.attachments.file_type === 'video' ? (
                          <video
                            src={evidence.attachments.b2_url}
                            controls
                            className="max-w-full max-h-64 rounded border border-gray-200 bg-black"
                          />
                        ) : (
                          <a
                            href={evidence.attachments.b2_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sheraton-gold hover:underline inline-block"
                          >
                            📎 {evidence.attachments.original_name}
                          </a>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Approved: {new Date(evidence.approved_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Evidence */}
          {pendingEvidence.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-3">⏳ Pending Approval</p>
              <div className="space-y-3">
                {pendingEvidence.map((evidence: any) => (
                  <div key={evidence.id} className="bg-white p-3 rounded border border-gray-200">
                    <p className="font-medium text-gray-800">{evidence.evidence_type.toUpperCase()}</p>
                    {evidence.description && <p className="text-sm text-gray-600 mt-1">{evidence.description}</p>}

                    {/* Attachment preview */}
                    {evidence.attachments && (
                      <div className="mt-3 rounded overflow-hidden">
                        {evidence.attachments.file_type === 'image' ? (
                          <img
                            src={evidence.attachments.b2_url}
                            alt={evidence.attachments.original_name}
                            className="max-w-full max-h-64 rounded border border-gray-200"
                          />
                        ) : evidence.attachments.file_type === 'video' ? (
                          <video
                            src={evidence.attachments.b2_url}
                            controls
                            className="max-w-full max-h-64 rounded border border-gray-200 bg-black"
                          />
                        ) : (
                          <a
                            href={evidence.attachments.b2_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sheraton-gold hover:underline inline-block"
                          >
                            📎 {evidence.attachments.original_name}
                          </a>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(evidence.submitted_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Evidence */}
          {!showEvidenceUpload ? (
            <button
              onClick={() => setShowEvidenceUpload(true)}
              className="w-full px-4 py-2 border-2 border-sheraton-gold text-sheraton-gold rounded-lg font-medium hover:bg-sheraton-gold hover:bg-opacity-5"
            >
              + Upload Evidence
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="signature">Signature</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="e.g., Photos showing completion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <EvidenceUploadZone
                onFilesSelected={handleFileSelected}
                isUploading={isSubmitting}
                maxFiles={5}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEvidenceUpload(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Issues Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
          Issues & Blockers {openIssues.length > 0 && `(${openIssues.length} open)`}
        </h3>

        {openIssues.length > 0 && (
          <div className="mb-4 space-y-3">
            {openIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 border-l-4 rounded-lg ${
                  issue.severity === "critical"
                    ? "border-red-600 bg-red-50"
                    : issue.severity === "high"
                    ? "border-orange-600 bg-orange-50"
                    : "border-yellow-600 bg-yellow-50"
                }`}
              >
                <p className="font-medium text-gray-800">{issue.title}</p>
                <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                <p className="text-xs text-gray-600 mt-2">Severity: {issue.severity.toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}

        {!showIssueForm ? (
          <button
            onClick={() => setShowIssueForm(true)}
            className="w-full px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50"
          >
            + Raise Issue
          </button>
        ) : (
          <div className="space-y-4 p-4 bg-red-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title
              </label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="e.g., Material delivery delayed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={issueSeverity}
                onChange={(e) => setIssueSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRaiseIssue}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? "Raising..." : "Raise Issue"}
              </button>
              <button
                onClick={() => setShowIssueForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit for Review */}
      {taskReport && taskReport.status === "in_progress" && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-sheraton-gold">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Ready for Review?</h3>
          <p className="text-gray-700 mb-4">
            When you've completed the work and submitted all required evidence, submit your report for manager review.
          </p>
          {percentage < 100 && (
            <p className="text-sm text-orange-600 mb-4">
              ⚠ Note: Mark completion at 100% to submit for review.
            </p>
          )}
          <button
            onClick={handleSubmitForReview}
            disabled={isSubmitting || !isReportComplete}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
              isReportComplete
                ? "bg-sheraton-gold text-sheraton-navy hover:bg-opacity-90"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } disabled:opacity-50`}
          >
            {isSubmitting ? "Submitting..." : "✓ Submit Report for Manager Review"}
          </button>
        </div>
      )}

      {taskReport && taskReport.status === "completed_pending_approval" && (
        <div className="bg-yellow-50 rounded-lg shadow-md p-6 border-2 border-yellow-400">
          <p className="text-center font-semibold text-yellow-800">
            ⏳ Report submitted and awaiting manager approval
          </p>
        </div>
      )}

      {taskReport && taskReport.status === "approved" && (
        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-500">
          <p className="text-center font-semibold text-green-800">
            ✓ Report approved! Task marked as complete.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderReportForm;
