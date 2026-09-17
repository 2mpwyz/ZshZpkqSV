import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase, Task as TaskType, UserProfile, TaskReport, TaskChecklist, TaskChecklistItem, TaskReportChecklistItem, TaskEvidenceSubmission, TaskIssue, TaskEvidenceRequirement } from "../../../../lib/supabase";
import { toast } from "../../../../hooks/use-toast";
import ProviderReportForm from "./ProviderReportForm";
import ManagerReportView from "./ManagerReportView";

interface ReportsTabProps {
  tasks: TaskType[];
  currentUser: any;
  currentUserProfile: UserProfile | null;
  userRole: "guest" | "manager" | "service_provider" | null;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  tasks,
  currentUser,
  currentUserProfile,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<"provider" | "manager">(
    userRole === "service_provider" ? "provider" : "manager"
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [taskReport, setTaskReport] = useState<TaskReport | null>(null);
  const [checklist, setChecklist] = useState<TaskChecklist | null>(null);
  const [checklistItems, setChecklistItems] = useState<TaskChecklistItem[]>([]);
  const [reportChecklistItems, setReportChecklistItems] = useState<TaskReportChecklistItem[]>([]);
  const [evidenceSubmissions, setEvidenceSubmissions] = useState<TaskEvidenceSubmission[]>([]);
  const [issues, setIssues] = useState<TaskIssue[]>([]);
  const [evidenceRequirements, setEvidenceRequirements] = useState<TaskEvidenceRequirement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialLoadRef = useRef(true);

  // Determine which tasks to show based on role (memoized to prevent infinite useEffect loops)
  const relevantTasks = useMemo(() =>
    userRole === "service_provider"
      ? tasks.filter((t) => t.assigned_to === currentUserProfile?.id && t.status === "in_progress")
      : tasks.filter((t) => t.status === "in_progress"),
    [tasks, userRole, currentUserProfile?.id]
  );

  // Load data when task selection changes and set up polling for real-time updates
  useEffect(() => {
    if (!selectedTaskId) {
      if (relevantTasks.length > 0) {
        setSelectedTaskId(relevantTasks[0].id);
      }
      return;
    }

    const task = relevantTasks.find((t) => t.id === selectedTaskId);
    if (task) {
      setSelectedTask(task);
      // Only load on initial selection, not on every poll
      if (isInitialLoadRef.current || !taskReport) {
        loadTaskReportData(selectedTaskId);
      }

      // Poll for updates every 5 seconds, but only if already loaded
      const pollInterval = setInterval(() => {
        if (!isInitialLoadRef.current && taskReport) {
          loadTaskReportData(selectedTaskId);
        }
      }, 5000);

      return () => clearInterval(pollInterval);
    }
  }, [selectedTaskId, relevantTasks]);

  const loadTaskReportData = async (taskId: string) => {
    // Only show loading on initial load, not on polls
    const shouldShowLoading = isInitialLoadRef.current;
    if (shouldShowLoading) {
      setIsLoading(true);
    }

    try {
      // Load task report (may not exist yet)
      const { data: reportData } = await supabase
        .from("task_reports")
        .select("*")
        .eq("task_id", taskId)
        .single();
      setTaskReport(reportData || null);

      // Load checklist (may not exist yet)
      const { data: checklistData } = await supabase
        .from("task_checklists")
        .select("*")
        .eq("task_id", taskId)
        .single();
      setChecklist(checklistData || null);

      if (checklistData) {
        // Load checklist items
        const { data: itemsData } = await supabase
          .from("task_checklist_items")
          .select("*")
          .eq("checklist_id", checklistData.id)
          .order("display_order");
        setChecklistItems(itemsData || []);

        // Load report checklist items if report exists
        if (reportData) {
          const { data: reportItemsData } = await supabase
            .from("task_report_checklist_items")
            .select("*")
            .eq("report_id", reportData.id);
          setReportChecklistItems(reportItemsData || []);
        }
      } else {
        setChecklistItems([]);
        setReportChecklistItems([]);
      }

      // Load evidence submissions with attachment details
      const { data: evidenceData } = await supabase
        .from("task_evidence_submissions")
        .select(`
          *,
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
        .eq("task_id", taskId)
        .order("submitted_at", { ascending: false });
      setEvidenceSubmissions(evidenceData || []);

      // Load issues
      const { data: issuesData } = await supabase
        .from("task_issues")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      setIssues(issuesData || []);

      // Load evidence requirements (may not exist yet)
      const { data: requirementsData } = await supabase
        .from("task_evidence_requirements")
        .select("*")
        .eq("task_id", taskId)
        .single();
      setEvidenceRequirements(requirementsData || null);
    } catch (error) {
      console.error("Error loading report data:", error);
      // Don't show error toast for missing data - it's expected that reports may not exist yet
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      }
    }
  };

  if (relevantTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No in-progress tasks to report on</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Selection */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Task</h3>
        <select
          value={selectedTaskId || ""}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sheraton-gold focus:border-transparent"
        >
          {relevantTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title} ({task.priority})
            </option>
          ))}
        </select>
      </div>

      {selectedTask && !isLoading && (
        <>
          {/* Role-based content */}
          {userRole === "service_provider" ? (
            <ProviderReportForm
              task={selectedTask}
              taskReport={taskReport}
              checklist={checklist}
              checklistItems={checklistItems}
              reportChecklistItems={reportChecklistItems}
              evidenceSubmissions={evidenceSubmissions}
              evidenceRequirements={evidenceRequirements}
              issues={issues}
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
              onReportUpdated={() => loadTaskReportData(selectedTask.id)}
            />
          ) : (
            <ManagerReportView
              task={selectedTask}
              taskReport={taskReport}
              checklist={checklist}
              checklistItems={checklistItems}
              reportChecklistItems={reportChecklistItems}
              evidenceSubmissions={evidenceSubmissions}
              evidenceRequirements={evidenceRequirements}
              issues={issues}
              currentUser={currentUser}
              onEvidenceApproved={() => loadTaskReportData(selectedTask.id)}
              onIssueResolved={() => loadTaskReportData(selectedTask.id)}
            />
          )}
        </>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-sheraton-gold border-opacity-30 border-t-sheraton-gold rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 mt-3 text-sm">Loading report...</p>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
