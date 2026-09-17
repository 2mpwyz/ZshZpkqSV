import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database
export interface UserProfile {
  id: string
  email: string
  role: 'guest' | 'manager' | 'service_provider'
  first_name: string
  last_name: string
  phone: string
  room_number?: string
  service_type?: string // for service providers
  service_category?: string // internal or external
  menu_access_role?: 'none' | 'chef' | 'food_beverage_manager'
  menu_access_approved?: boolean
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  user_id: string
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  b2_url: string
  b2_file_id?: string
  file_type: 'image' | 'video' | 'file' | 'audio'
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  user_id: string | null
  guest_name: string
  email: string
  room_number: string
  complaint_type: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
  attachments?: string[] // Deprecated - use complaint_attachments table
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  complaint_id: string | null
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'in_review' | 'completed'
  category: 'operations' | 'service' | 'training' | 'maintenance' | null
  assigned_to: string | null
  assignee_name: string | null
  assigned_category: 'internal' | 'external' | null
  due_date: string | null
  estimated_time: string | null
  payment_terms: string | null
  attachments?: Array<{id: string; name: string; type: string; size: number}> // Deprecated - use task_attachments table
  is_from_complaint: boolean
  budget: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  complaint_id: string | null
  task_id: string | null
  type: 'complaint_filed' | 'complaint_acknowledged' | 'task_created' | 'task_updated' | 'task_assigned' | 'task_accepted' | 'task_declined' | 'task_proposed' | 'proposal_accepted' | 'proposal_declined' | 'proposal_updated' | 'todo_created' | 'task_message'
  message: string
  is_read: boolean
  created_at: string
}

export interface TaskResponse {
  id: string
  task_id: string
  provider_id: string
  action: 'accept' | 'decline' | 'propose'
  response_message: string | null
  created_at: string
  updated_at: string
}

export interface TaskProposal {
  id: string
  task_id: string
  provider_id: string
  manager_id: string
  status: 'pending' | 'accepted' | 'declined' | 'counter_proposed'
  quoted_price: number | null
  proposal_notes: string | null
  proposed_timeline: string | null
  attachments: Array<{id: string; name: string; size: number}> | null
  created_at: string
  updated_at: string
}

export interface TodoListItem {
  id: string
  task_id: string
  provider_id: string
  status: 'pending' | 'in_progress' | 'completed'
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  estimated_hours: number | null
  details: {
    category?: string
    estimated_time?: string
    payment_terms?: string
    budget?: number
  } | null
  attachments: Array<{id: string; name: string; size: number}> | null
  created_at: string
  completed_at: string | null
  updated_at: string
}

export interface TaskMessage {
  id: string
  task_id: string
  sender_id: string
  sender_role: 'manager' | 'service_provider'
  message_text: string
  attachments: Array<{id: string; name: string; size: number}> | null
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface TaskMessageAttachment {
  id: string
  message_id: string
  attachment_id: string
  created_at: string
}

// ============================================================================
// REPORTS FEATURE TYPES
// ============================================================================

export interface TaskChecklist {
  id: string
  task_id: string
  title: string
  description: string | null
  is_required: boolean
  created_at: string
  updated_at: string
}

export interface TaskChecklistItem {
  id: string
  checklist_id: string
  label: string
  description: string | null
  display_order: number
  created_at: string
}

export interface TaskEvidenceRequirement {
  id: string
  task_id: string
  required_evidence_types: string[]
  description: string | null
  created_at: string
  updated_at: string
}

export interface TaskReport {
  id: string
  task_id: string
  provider_id: string
  status: 'in_progress' | 'completed_pending_approval' | 'approved'
  description: string
  percentage_complete: number
  last_updated_by: string
  created_at: string
  updated_at: string
}

export interface TaskReportChecklistItem {
  id: string
  report_id: string
  checklist_item_id: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskEvidenceSubmission {
  id: string
  task_id: string
  provider_id: string
  evidence_type: 'photo' | 'video' | 'document' | 'signature'
  attachment_id: string
  description: string | null
  submitted_at: string
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface TaskIssue {
  id: string
  task_id: string
  provider_id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'acknowledged' | 'resolved'
  resolved_at: string | null
  created_at: string
  updated_at: string
}
