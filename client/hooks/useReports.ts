import { useState, useCallback, useEffect } from "react";
import { supabase, TaskReport, TaskChecklist, TaskChecklistItem, TaskReportChecklistItem, TaskEvidenceSubmission, TaskIssue, TaskEvidenceRequirement } from "../lib/supabase";
import { toast } from "./use-toast";

interface ReportData {
  report: TaskReport | null;
  checklist: TaskChecklist | null;
  checklistItems: TaskChecklistItem[];
  reportChecklistItems: TaskReportChecklistItem[];
  evidenceSubmissions: TaskEvidenceSubmission[];
  issues: TaskIssue[];
  evidenceRequirements: TaskEvidenceRequirement | null;
  isLoading: boolean;
  isSubmitting: boolean;
}

export const useReports = (taskId: string | null) => {
  const [data, setData] = useState<ReportData>({
    report: null,
    checklist: null,
    checklistItems: [],
    reportChecklistItems: [],
    evidenceSubmissions: [],
    issues: [],
    evidenceRequirements: null,
    isLoading: false,
    isSubmitting: false,
  });

  // Load all report-related data for a task
  const loadTaskReportData = useCallback(async () => {
    if (!taskId) return;

    setData((prev) => ({ ...prev, isLoading: true }));

    try {
      // Parallel loads for better performance
      const [
        reportResult,
        checklistResult,
        evidenceResult,
        issuesResult,
        requirementsResult,
      ] = await Promise.all([
        supabase.from("task_reports").select("*").eq("task_id", taskId).single(),
        supabase.from("task_checklists").select("*").eq("task_id", taskId).single(),
        supabase
          .from("task_evidence_submissions")
          .select("*")
          .eq("task_id", taskId)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("task_issues")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false }),
        supabase
          .from("task_evidence_requirements")
          .select("*")
          .eq("task_id", taskId)
          .single(),
      ]);

      let checklistItemsData: TaskChecklistItem[] = [];
      let reportChecklistItemsData: TaskReportChecklistItem[] = [];

      // If checklist exists, load its items and report items
      if (checklistResult.data) {
        const itemsResult = await supabase
          .from("task_checklist_items")
          .select("*")
          .eq("checklist_id", checklistResult.data.id)
          .order("display_order");
        checklistItemsData = itemsResult.data || [];

        if (reportResult.data) {
          const reportItemsResult = await supabase
            .from("task_report_checklist_items")
            .select("*")
            .eq("report_id", reportResult.data.id);
          reportChecklistItemsData = reportItemsResult.data || [];
        }
      }

      setData((prev) => ({
        ...prev,
        report: reportResult.data || null,
        checklist: checklistResult.data || null,
        checklistItems: checklistItemsData,
        reportChecklistItems: reportChecklistItemsData,
        evidenceSubmissions: evidenceResult.data || [],
        issues: issuesResult.data || [],
        evidenceRequirements: requirementsResult.data || null,
      }));
    } catch (error) {
      console.error("Error loading report data:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, [taskId]);

  // Load data on taskId change
  useEffect(() => {
    loadTaskReportData();
  }, [loadTaskReportData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!taskId) return;

    const subscriptions = [
      supabase
        .channel(`task_reports:${taskId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "task_reports", filter: `task_id=eq.${taskId}` },
          () => loadTaskReportData()
        )
        .subscribe(),

      supabase
        .channel(`task_issues:${taskId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "task_issues", filter: `task_id=eq.${taskId}` },
          () => loadTaskReportData()
        )
        .subscribe(),

      supabase
        .channel(`task_evidence:${taskId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "task_evidence_submissions", filter: `task_id=eq.${taskId}` },
          () => loadTaskReportData()
        )
        .subscribe(),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [taskId, loadTaskReportData]);

  // Update report
  const updateReport = useCallback(
    async (description: string, percentage: number, lastUpdatedBy: string) => {
      if (!data.report) return;

      setData((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await supabase
          .from("task_reports")
          .update({
            description,
            percentage_complete: percentage,
            last_updated_by: lastUpdatedBy,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.report.id);

        toast({
          title: "Success",
          description: "Progress report updated",
        });

        await loadTaskReportData();
      } catch (error) {
        console.error("Error updating report:", error);
        toast({
          title: "Error",
          description: "Failed to update report",
          variant: "destructive",
        });
      } finally {
        setData((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [data.report, loadTaskReportData]
  );

  // Toggle checklist item
  const toggleChecklistItem = useCallback(
    async (itemId: string, isCompleted: boolean) => {
      if (!data.report) return;

      try {
        if (isCompleted) {
          // Delete
          await supabase
            .from("task_report_checklist_items")
            .delete()
            .eq("report_id", data.report.id)
            .eq("checklist_item_id", itemId);
        } else {
          // Insert
          await supabase.from("task_report_checklist_items").insert({
            report_id: data.report.id,
            checklist_item_id: itemId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });
        }

        await loadTaskReportData();
      } catch (error) {
        console.error("Error toggling checklist item:", error);
        toast({
          title: "Error",
          description: "Failed to update checklist",
          variant: "destructive",
        });
      }
    },
    [data.report, loadTaskReportData]
  );

  // Approve evidence
  const approveEvidence = useCallback(
    async (evidenceId: string, approvedBy: string) => {
      setData((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await supabase
          .from("task_evidence_submissions")
          .update({
            approved_at: new Date().toISOString(),
            approved_by: approvedBy,
            updated_at: new Date().toISOString(),
          })
          .eq("id", evidenceId);

        toast({
          title: "Success",
          description: "Evidence approved",
        });

        await loadTaskReportData();
      } catch (error) {
        console.error("Error approving evidence:", error);
        toast({
          title: "Error",
          description: "Failed to approve evidence",
          variant: "destructive",
        });
      } finally {
        setData((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [loadTaskReportData]
  );

  // Resolve issue
  const resolveIssue = useCallback(
    async (issueId: string) => {
      setData((prev) => ({ ...prev, isSubmitting: true }));

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
          description: "Issue resolved",
        });

        await loadTaskReportData();
      } catch (error) {
        console.error("Error resolving issue:", error);
        toast({
          title: "Error",
          description: "Failed to resolve issue",
          variant: "destructive",
        });
      } finally {
        setData((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [loadTaskReportData]
  );

  return {
    ...data,
    loadTaskReportData,
    updateReport,
    toggleChecklistItem,
    approveEvidence,
    resolveIssue,
  };
};
