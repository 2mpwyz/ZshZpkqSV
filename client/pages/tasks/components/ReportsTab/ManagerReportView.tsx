import React, { useState } from "react";
import { supabase, Task as TaskType, TaskReport, TaskChecklist, TaskChecklistItem, TaskReportChecklistItem, TaskEvidenceSubmission, TaskIssue, TaskEvidenceRequirement } from "../../../../lib/supabase";
import { toast } from "../../../../hooks/use-toast";
import EvidenceGallery from "./EvidenceGallery";

interface ManagerReportViewProps {
  task: TaskType;
  taskReport: TaskReport | null;
  checklist: TaskChecklist | null;
  checklistItems: TaskChecklistItem[];
  reportChecklistItems: TaskReportChecklistItem[];
  evidenceSubmissions: TaskEvidenceSubmission[];
  evidenceRequirements: TaskEvidenceRequirement | null;
  issues: TaskIssue[];
  currentUser: any;
  onEvidenceApproved: () => void;
  onIssueResolved: () => void;
}

const ManagerReportView: React.FC<ManagerReportViewProps> = ({
  task,
  taskReport,
  checklist,
  checklistItems,
  reportChecklistItems,
  evidenceSubmissions,
  evidenceRequirements,
  issues,
  currentUser,
  onEvidenceApproved,
  onIssueResolved,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openIssues = issues.filter((i) => i.status === "open");
  const completionPercentage = taskReport?.percentage_complete || 0;

  const handleResolveIssue = async (issueId: string) => {
    setIsSubmitting(true);
    try {
      await supabase
        .from("task_issues")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", issueId);

      toast({
        title: "Success",
        description: "Issue marked as resolved",
      });
      onIssueResolved();
    } catch (error) {
      console.error("Error resolving issue:", error);
      toast({
        title: "Error",
        description: "Failed to resolve issue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveTask = async () => {
    if (!taskReport || !task.assigned_to) return;

    setIsSubmitting(true);
    try {
      // Get the auth.users.id for the assigned provider
      const { data: providerProfile } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("id", task.assigned_to)
        .single();

      // Update report status to approved
      await supabase
        .from("task_reports")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskReport.id);

      // Update task status to completed
      await supabase
        .from("tasks")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      // Create notification to the provider (use their auth.users.id)
      if (providerProfile?.user_id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: providerProfile.user_id,
            task_id: task.id,
            type: "task_updated",
            message: `Your task "${task.title}" has been approved and marked complete.`,
          });
      }

      toast({
        title: "Success",
        description: "Task approved and marked complete",
      });

      onEvidenceApproved();
    } catch (error) {
      console.error("Error approving task:", error);
      toast({
        title: "Error",
        description: "Failed to approve task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!taskReport) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No report submitted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">{task.title}</h3>
        <p className="text-gray-700 mb-4">{task.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Priority</p>
            <p className="font-medium text-gray-900">{task.priority}</p>
          </div>
          <div>
            <p className="text-gray-600">Budget</p>
            <p className="font-medium text-gray-900">${task.budget}</p>
          </div>
        </div>
      </div>

      {/* Progress Report */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Provider Progress Report</h3>

        {/* Completion Status */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Status</span>
            <span className="text-2xl font-bold text-sheraton-gold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-sheraton-gold h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Report Status */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            Status: <span className="uppercase">{taskReport.status.replace(/_/g, " ")}</span>
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Report Description</p>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{taskReport.description}</p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-600">
          Last updated: {new Date(taskReport.updated_at).toLocaleString()}
        </p>
      </div>

      {/* Checklist Progress */}
      {checklist && checklistItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
            Checklist Progress
          </h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Items Completed</span>
              <span className="font-semibold text-gray-900">
                {reportChecklistItems.filter((item) => item.is_completed).length}/{checklistItems.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (reportChecklistItems.filter((item) => item.is_completed).length /
                      checklistItems.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const isCompleted = reportChecklistItems.some(
                (ri) => ri.checklist_item_id === item.id && ri.is_completed
              );
              return (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isCompleted ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                    {isCompleted && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={isCompleted ? "line-through text-gray-500" : "text-gray-800"}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence Review Gallery */}
      {evidenceSubmissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Evidence Review</h3>

          {evidenceRequirements && (
            <p className="text-sm text-gray-600 mb-6">
              Required: {evidenceRequirements.required_evidence_types.join(", ")}
            </p>
          )}

          <EvidenceGallery evidenceSubmissions={evidenceSubmissions} />
        </div>
      )}

      {/* Issues & Blockers */}
      {issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
            Issues & Blockers
          </h3>

          {openIssues.length > 0 && (
            <div className="mb-4 p-4 border-l-4 border-red-600 bg-red-50 rounded-lg">
              <p className="font-semibold text-red-900 mb-3">🚩 Open Issues ({openIssues.length})</p>
              <div className="space-y-3">
                {openIssues.map((issue) => (
                  <div key={issue.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{issue.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        <p className={`text-xs mt-2 font-semibold ${
                          issue.severity === "critical"
                            ? "text-red-600"
                            : issue.severity === "high"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}>
                          Severity: {issue.severity.toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveIssue(issue.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap ml-3"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Issues */}
          {issues.filter((i) => i.status === "resolved").length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                ✓ Resolved ({issues.filter((i) => i.status === "resolved").length})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Approval Actions */}
      {taskReport.status === "completed_pending_approval" && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-sheraton-gold">
          <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Ready for Approval</h3>
          <p className="text-gray-700 mb-4">
            All work appears complete. Review the report, checklist, and evidence above, then approve to mark the task as complete.
          </p>
          <button
            onClick={handleApproveTask}
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-sheraton-gold text-sheraton-navy rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Approving..." : "✓ Approve & Complete Task"}
          </button>
        </div>
      )}

      {taskReport.status === "approved" && (
        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-500">
          <p className="text-center font-semibold text-green-800">
            ✓ Task Approved and Completed
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerReportView;
