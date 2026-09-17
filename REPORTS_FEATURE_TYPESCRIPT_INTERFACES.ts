/**
 * Reports Feature TypeScript Interfaces
 * 
 * Add these interfaces to your client/lib/supabase.ts file
 * These correspond to the SQL tables created in the migration
 */

// ============================================================================
// 1. TASK CHECKLIST INTERFACES
// ============================================================================

/**
 * Represents a checklist template for a task
 * Tasks can have one or more checklists (though typically one)
 */
export interface TaskChecklist {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Individual item within a checklist
 * E.g., "Paint walls", "Install fixtures", etc.
 */
export interface TaskChecklistItem {
  id: string;
  checklist_id: string;
  label: string;
  description?: string | null;
  display_order: number;
  created_at: string;
}

// ============================================================================
// 2. EVIDENCE REQUIREMENT INTERFACES
// ============================================================================

/**
 * Specifies what kind of evidence/proof is needed for a task
 * Manager defines this when creating the task
 */
export interface TaskEvidenceRequirement {
  id: string;
  task_id: string;
  required_evidence_types: EvidenceType[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Types of evidence that can be submitted
 */
export type EvidenceType = 'photo' | 'video' | 'document' | 'signature';

// ============================================================================
// 3. TASK REPORT INTERFACES
// ============================================================================

/**
 * Service provider's progress report on an in-progress task
 * One report per task, updated as work progresses
 */
export interface TaskReport {
  id: string;
  task_id: string;
  provider_id: string; // FK to user_profiles
  status: 'in_progress' | 'completed_pending_approval' | 'approved';
  description: string; // Narrative description of work done
  percentage_complete: number; // 0-100
  last_updated_by: string; // FK to auth.users
  created_at: string;
  updated_at: string;
}

/**
 * Represents the status of a single checklist item in a task report
 */
export interface TaskReportChecklistItem {
  id: string;
  report_id: string;
  checklist_item_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// 4. EVIDENCE SUBMISSION INTERFACES
// ============================================================================

/**
 * Individual evidence submission from service provider
 * Can be a photo, video, document, or signature
 */
export interface TaskEvidenceSubmission {
  id: string;
  task_id: string;
  provider_id: string; // FK to user_profiles
  evidence_type: EvidenceType;
  attachment_id: string; // FK to attachments
  description: string | null;
  submitted_at: string;
  approved_at: string | null; // Null until manager approves
  approved_by: string | null; // FK to auth.users (manager who approved)
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// 5. TASK ISSUE INTERFACES
// ============================================================================

/**
 * Issues or blockers raised by service provider
 * When created, task is flagged for manager attention
 */
export interface TaskIssue {
  id: string;
  task_id: string;
  provider_id: string; // FK to user_profiles
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'acknowledged' | 'resolved';

// ============================================================================
// 6. HELPER/AGGREGATE INTERFACES
// ============================================================================

/**
 * Comprehensive report view including all related data
 * Used for manager's Reports tab
 */
export interface TaskReportSummary {
  // Report core data
  report_id: string;
  task_id: string;
  task_title: string;
  task_priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Provider info
  provider_id: string;
  provider_name: string;
  
  // Progress tracking
  status: TaskReport['status'];
  percentage_complete: number;
  description: string;
  updated_at: string;
  
  // Checklist summary
  total_checklist_items: number;
  completed_checklist_items: number;
  checklist_completion_percentage: number;
  
  // Evidence tracking
  pending_evidence_count: number;
  approved_evidence_count: number;
  
  // Issues tracking
  open_issues_count: number;
  open_critical_issues: boolean; // True if any critical issues are open
}

/**
 * Represents a flagged task (one with open high/critical issues)
 */
export interface FlaggedTask {
  task_id: string;
  task_title: string;
  task_priority: 'low' | 'medium' | 'high' | 'urgent';
  issue_severity: IssueSeverity;
  open_issues_count: number;
  latest_issue_date: string;
}

/**
 * Used when provider is filling out a progress report
 */
export interface ProviderReportDraft {
  description: string;
  percentage_complete: number;
  checklist_items_completed: string[]; // Array of TaskChecklistItem IDs that are completed
  new_issues?: {
    title: string;
    description: string;
    severity: IssueSeverity;
  };
  evidence_submissions?: {
    evidence_type: EvidenceType;
    attachment_id: string;
    description?: string;
  }[];
}

/**
 * Complete evidence submission with attachment data
 */
export interface EvidenceSubmissionWithAttachment extends TaskEvidenceSubmission {
  attachment: {
    filename: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    b2_url: string;
    file_type: 'image' | 'video' | 'file' | 'audio';
  };
}

// ============================================================================
// 7. QUERY RESULT INTERFACES
// ============================================================================

/**
 * Used for fetching task reports with pagination
 */
export interface TaskReportsQueryResult {
  reports: TaskReport[];
  total_count: number;
}

/**
 * Task with all related report data (for detail view)
 */
export interface TaskWithReportData {
  task: Task;
  checklist: TaskChecklist | null;
  checklist_items: TaskChecklistItem[];
  evidence_requirements: TaskEvidenceRequirement | null;
  latest_report: TaskReport | null;
  evidence_submissions: EvidenceSubmissionWithAttachment[];
  issues: TaskIssue[];
}

// ============================================================================
// 8. FORM/SUBMISSION INTERFACES
// ============================================================================

/**
 * Manager's form when creating a new task with checklist and evidence
 */
export interface NewTaskWithChecklistForm {
  // Standard task fields (from Task interface)
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'operations' | 'service' | 'training' | 'maintenance';
  assigned_to: string; // user_profiles.id of service provider
  assigned_category: 'internal' | 'external';
  due_date?: string;
  estimated_time?: string;
  payment_terms?: string;
  budget?: number;
  
  // New: Checklist section
  checklist?: {
    title: string;
    description?: string;
    is_required: boolean;
    items: {
      label: string;
      description?: string;
      display_order: number;
    }[];
  };
  
  // New: Evidence requirements
  evidence_requirements?: {
    required_types: EvidenceType[];
    description?: string;
  };
}

/**
 * Manager's approval/rejection of evidence
 */
export interface EvidenceApprovalAction {
  evidence_submission_id: string;
  approved: boolean; // true = approve, false = reject/request changes
  notes?: string; // Optional feedback to provider
}

/**
 * Provider's issue report
 */
export interface IssueReportSubmission {
  task_id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
}

// ============================================================================
// 9. NOTIFICATION PAYLOAD INTERFACES
// ============================================================================

/**
 * Notification types related to reports
 * Add these to your existing notification type union
 */
export type ReportNotificationType = 
  | 'report_submitted'      // Provider submitted progress report
  | 'evidence_approved'      // Manager approved evidence
  | 'issue_raised'          // Provider raised an issue
  | 'issue_resolved'        // Manager resolved an issue
  | 'task_flagged'          // Task flagged due to critical issue
  | 'task_approval_ready';  // Evidence complete, ready for approval

/**
 * Notification payload for report-related events
 */
export interface ReportNotificationPayload {
  type: ReportNotificationType;
  task_id: string;
  task_title: string;
  provider_name?: string;
  manager_name?: string;
  data?: {
    percentage_complete?: number;
    issue_severity?: IssueSeverity;
    evidence_type?: EvidenceType;
    [key: string]: any;
  };
}

// ============================================================================
// 10. FILTER/SORT INTERFACES
// ============================================================================

/**
 * Filters for manager's Reports tab
 */
export interface ReportFilters {
  status?: TaskReport['status'];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  has_open_issues?: boolean;
  provider_id?: string;
  date_range?: {
    from: string;
    to: string;
  };
}

/**
 * Sort options for reports list
 */
export type ReportSortBy = 
  | 'updated_at_desc'
  | 'updated_at_asc'
  | 'percentage_complete_desc'
  | 'percentage_complete_asc'
  | 'severity_desc'
  | 'created_at_desc';

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Manager creating a task with checklist
const newTaskData: NewTaskWithChecklistForm = {
  title: 'Room Renovation - Suite 305',
  description: 'Complete renovation...',
  priority: 'high',
  category: 'service',
  assigned_to: 'provider-profile-id',
  assigned_category: 'internal',
  due_date: '2024-01-15',
  budget: 2500,
  checklist: {
    title: 'Renovation Checklist',
    is_required: true,
    items: [
      { label: 'Prepare walls', display_order: 1 },
      { label: 'Paint walls', display_order: 2 },
      { label: 'Install fixtures', display_order: 3 },
    ]
  },
  evidence_requirements: {
    required_types: ['photo', 'video'],
    description: 'Photos from multiple angles and time-lapse video'
  }
};

// Example 2: Provider submitting progress report
const reportDraft: ProviderReportDraft = {
  description: 'Completed wall preparation and first coat of paint',
  percentage_complete: 35,
  checklist_items_completed: ['item-id-1', 'item-id-2'],
  new_issues: {
    title: 'Paint delivery delayed',
    description: 'Ordered paint arrives 2 days late',
    severity: 'medium'
  }
};

// Example 3: Manager viewing reports
const filters: ReportFilters = {
  has_open_issues: true,
  priority: 'high'
};

// Example 4: Type-safe evidence submission with attachment
const evidenceWithAttachment: EvidenceSubmissionWithAttachment = {
  id: 'evidence-id',
  task_id: 'task-id',
  provider_id: 'provider-id',
  evidence_type: 'photo',
  attachment_id: 'attachment-id',
  description: 'Wall preparation complete',
  submitted_at: '2024-01-10',
  approved_at: '2024-01-11',
  approved_by: 'manager-user-id',
  attachment: {
    filename: 'wall-prep-01.jpg',
    original_name: 'IMG_1234.jpg',
    file_size: 2048576,
    mime_type: 'image/jpeg',
    b2_url: 'https://...',
    file_type: 'image'
  }
};

*/

// ============================================================================
// EXPORT SUMMARY
// ============================================================================
export type {
  TaskChecklist,
  TaskChecklistItem,
  TaskEvidenceRequirement,
  TaskReport,
  TaskReportChecklistItem,
  TaskEvidenceSubmission,
  TaskIssue,
  TaskReportSummary,
  FlaggedTask,
  ProviderReportDraft,
  EvidenceSubmissionWithAttachment,
  TaskReportsQueryResult,
  TaskWithReportData,
  NewTaskWithChecklistForm,
  EvidenceApprovalAction,
  IssueReportSubmission,
  ReportNotificationPayload,
  ReportFilters,
};

export type {
  EvidenceType,
  IssueSeverity,
  IssueStatus,
  ReportNotificationType,
  ReportSortBy,
};
