-- ============================================================================
-- REPORTS FEATURE SQL MIGRATION
-- ============================================================================
-- This migration adds the complete task reporting infrastructure including:
-- - Task checklists
-- - Evidence requirements
-- - Progress reports
-- - Issue/blocker tracking
-- - RLS policies for security
-- ============================================================================

-- ============================================================================
-- 1. TASK CHECKLISTS TABLE
-- ============================================================================
-- Stores checklist templates for tasks (multiple checklists per task if needed)

CREATE TABLE IF NOT EXISTS public.task_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_checklists_pkey PRIMARY KEY (id),
  CONSTRAINT task_checklists_task_id_fkey FOREIGN KEY (task_id) 
    REFERENCES tasks (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task_id 
  ON public.task_checklists USING btree (task_id);

CREATE INDEX IF NOT EXISTS idx_task_checklists_created_at 
  ON public.task_checklists USING btree (created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_task_checklists_updated_at BEFORE UPDATE ON task_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TASK CHECKLIST ITEMS TABLE
-- ============================================================================
-- Individual items within a checklist (e.g., "Paint wall", "Install fixture", etc.)

CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_checklist_items_pkey PRIMARY KEY (id),
  CONSTRAINT task_checklist_items_checklist_id_fkey FOREIGN KEY (checklist_id) 
    REFERENCES task_checklists (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_checklist_items_checklist_id 
  ON public.task_checklist_items USING btree (checklist_id);

CREATE INDEX IF NOT EXISTS idx_task_checklist_items_order 
  ON public.task_checklist_items USING btree (checklist_id, display_order);

-- ============================================================================
-- 3. TASK EVIDENCE REQUIREMENTS TABLE
-- ============================================================================
-- Manager specifies what proof/evidence is needed for task completion
-- (e.g., photos, videos, signed documents)

CREATE TABLE IF NOT EXISTS public.task_evidence_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL UNIQUE,
  required_evidence_types VARCHAR[] NOT NULL DEFAULT ARRAY['photo']::VARCHAR[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_evidence_requirements_pkey PRIMARY KEY (id),
  CONSTRAINT task_evidence_requirements_task_id_fkey FOREIGN KEY (task_id) 
    REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT evidence_types_check CHECK (
    required_evidence_types <@ ARRAY['photo', 'video', 'document', 'signature']::VARCHAR[]
  )
);

CREATE INDEX IF NOT EXISTS idx_task_evidence_requirements_task_id 
  ON public.task_evidence_requirements USING btree (task_id);

CREATE TRIGGER update_task_evidence_requirements_updated_at BEFORE UPDATE ON task_evidence_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TASK REPORTS TABLE
-- ============================================================================
-- Service provider's progress reports on in-progress tasks
-- One report per task (updated as work progresses)

CREATE TABLE IF NOT EXISTS public.task_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL UNIQUE,
  provider_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress'::VARCHAR,
  description TEXT NOT NULL,
  percentage_complete INTEGER NOT NULL DEFAULT 0,
  last_updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_reports_pkey PRIMARY KEY (id),
  CONSTRAINT task_reports_task_id_fkey FOREIGN KEY (task_id) 
    REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT task_reports_provider_id_fkey FOREIGN KEY (provider_id) 
    REFERENCES user_profiles (id) ON DELETE CASCADE,
  CONSTRAINT task_reports_last_updated_by_fkey FOREIGN KEY (last_updated_by) 
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT task_reports_percentage_check CHECK (
    percentage_complete >= 0 AND percentage_complete <= 100
  ),
  CONSTRAINT task_reports_status_check CHECK (
    status::text = ANY (ARRAY[
      'in_progress'::text,
      'completed_pending_approval'::text,
      'approved'::text
    ])
  )
);

CREATE INDEX IF NOT EXISTS idx_task_reports_task_id 
  ON public.task_reports USING btree (task_id);

CREATE INDEX IF NOT EXISTS idx_task_reports_provider_id 
  ON public.task_reports USING btree (provider_id);

CREATE INDEX IF NOT EXISTS idx_task_reports_status 
  ON public.task_reports USING btree (status);

CREATE INDEX IF NOT EXISTS idx_task_reports_created_at 
  ON public.task_reports USING btree (created_at DESC);

CREATE TRIGGER update_task_reports_updated_at BEFORE UPDATE ON task_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TASK REPORT CHECKLIST ITEMS TABLE
-- ============================================================================
-- Tracks which checklist items have been completed in the report

CREATE TABLE IF NOT EXISTS public.task_report_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  checklist_item_id UUID NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_report_checklist_items_pkey PRIMARY KEY (id),
  CONSTRAINT task_report_checklist_items_unique UNIQUE (report_id, checklist_item_id),
  CONSTRAINT task_report_checklist_items_report_id_fkey FOREIGN KEY (report_id) 
    REFERENCES task_reports (id) ON DELETE CASCADE,
  CONSTRAINT task_report_checklist_items_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) 
    REFERENCES task_checklist_items (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_report_checklist_items_report_id 
  ON public.task_report_checklist_items USING btree (report_id);

CREATE INDEX IF NOT EXISTS idx_task_report_checklist_items_checklist_item_id 
  ON public.task_report_checklist_items USING btree (checklist_item_id);

CREATE TRIGGER update_task_report_checklist_items_updated_at BEFORE UPDATE ON task_report_checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. TASK EVIDENCE SUBMISSIONS TABLE
-- ============================================================================
-- Tracks evidence/proof submitted by service provider
-- (photos, videos, documents, signatures, etc.)

CREATE TABLE IF NOT EXISTS public.task_evidence_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  evidence_type VARCHAR(50) NOT NULL,
  attachment_id UUID NOT NULL,
  description TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_evidence_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT task_evidence_submissions_task_id_fkey FOREIGN KEY (task_id) 
    REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT task_evidence_submissions_provider_id_fkey FOREIGN KEY (provider_id) 
    REFERENCES user_profiles (id) ON DELETE CASCADE,
  CONSTRAINT task_evidence_submissions_attachment_id_fkey FOREIGN KEY (attachment_id) 
    REFERENCES attachments (id) ON DELETE CASCADE,
  CONSTRAINT task_evidence_submissions_approved_by_fkey FOREIGN KEY (approved_by) 
    REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT evidence_type_check CHECK (
    evidence_type::text = ANY (ARRAY[
      'photo'::text,
      'video'::text,
      'document'::text,
      'signature'::text
    ])
  )
);

CREATE INDEX IF NOT EXISTS idx_task_evidence_submissions_task_id 
  ON public.task_evidence_submissions USING btree (task_id);

CREATE INDEX IF NOT EXISTS idx_task_evidence_submissions_provider_id 
  ON public.task_evidence_submissions USING btree (provider_id);

CREATE INDEX IF NOT EXISTS idx_task_evidence_submissions_evidence_type 
  ON public.task_evidence_submissions USING btree (evidence_type);

CREATE INDEX IF NOT EXISTS idx_task_evidence_submissions_submitted_at 
  ON public.task_evidence_submissions USING btree (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_evidence_submissions_approved_at 
  ON public.task_evidence_submissions USING btree (approved_at DESC) 
  WHERE approved_at IS NOT NULL;

CREATE TRIGGER update_task_evidence_submissions_updated_at BEFORE UPDATE ON task_evidence_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. TASK ISSUES TABLE
-- ============================================================================
-- Track issues/blockers raised by service provider
-- When issue is raised, task is flagged for manager attention

CREATE TABLE IF NOT EXISTS public.task_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium'::VARCHAR,
  status VARCHAR(50) NOT NULL DEFAULT 'open'::VARCHAR,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT task_issues_pkey PRIMARY KEY (id),
  CONSTRAINT task_issues_task_id_fkey FOREIGN KEY (task_id) 
    REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT task_issues_provider_id_fkey FOREIGN KEY (provider_id) 
    REFERENCES user_profiles (id) ON DELETE CASCADE,
  CONSTRAINT task_issues_severity_check CHECK (
    severity::text = ANY (ARRAY[
      'low'::text,
      'medium'::text,
      'high'::text,
      'critical'::text
    ])
  ),
  CONSTRAINT task_issues_status_check CHECK (
    status::text = ANY (ARRAY[
      'open'::text,
      'acknowledged'::text,
      'resolved'::text
    ])
  )
);

CREATE INDEX IF NOT EXISTS idx_task_issues_task_id 
  ON public.task_issues USING btree (task_id);

CREATE INDEX IF NOT EXISTS idx_task_issues_provider_id 
  ON public.task_issues USING btree (provider_id);

CREATE INDEX IF NOT EXISTS idx_task_issues_severity 
  ON public.task_issues USING btree (severity);

CREATE INDEX IF NOT EXISTS idx_task_issues_status 
  ON public.task_issues USING btree (status);

CREATE INDEX IF NOT EXISTS idx_task_issues_created_at 
  ON public.task_issues USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_issues_open_critical
  ON public.task_issues USING btree (severity, status)
  WHERE status::text = 'open'::text AND severity::text = ANY (ARRAY['high'::text, 'critical'::text]);

CREATE TRIGGER update_task_issues_updated_at BEFORE UPDATE ON task_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_report_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_issues ENABLE ROW LEVEL SECURITY;

-- Task Checklists - View/Edit only for task creator and assigned provider
CREATE POLICY task_checklists_view
  ON public.task_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_checklists.task_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
      )
    )
  );

CREATE POLICY task_checklists_insert
  ON public.task_checklists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

-- Task Evidence Requirements - Managers only
CREATE POLICY task_evidence_requirements_view
  ON public.task_evidence_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_evidence_requirements.task_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
      )
    )
  );

CREATE POLICY task_evidence_requirements_insert
  ON public.task_evidence_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

-- Task Reports - Provider can view/edit own, Manager can view task's
CREATE POLICY task_reports_view
  ON public.task_reports FOR SELECT
  USING (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_reports.task_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY task_reports_insert
  ON public.task_reports FOR INSERT
  WITH CHECK (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY task_reports_update
  ON public.task_reports FOR UPDATE
  USING (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_reports.task_id AND t.created_by = auth.uid()
    )
  );

-- Task Report Checklist Items - Same as task reports
CREATE POLICY task_report_checklist_items_view
  ON public.task_report_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_reports tr
      WHERE tr.id = task_report_checklist_items.report_id
      AND (
        tr.provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
        OR EXISTS (
          SELECT 1 FROM tasks t
          WHERE t.id = tr.task_id AND t.created_by = auth.uid()
        )
      )
    )
  );

CREATE POLICY task_report_checklist_items_insert
  ON public.task_report_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_reports tr
      WHERE tr.id = report_id
      AND tr.provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY task_report_checklist_items_update
  ON public.task_report_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM task_reports tr
      WHERE tr.id = task_report_checklist_items.report_id
      AND tr.provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- Task Evidence Submissions - Provider can submit, Manager can approve
CREATE POLICY task_evidence_submissions_view
  ON public.task_evidence_submissions FOR SELECT
  USING (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_evidence_submissions.task_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY task_evidence_submissions_insert
  ON public.task_evidence_submissions FOR INSERT
  WITH CHECK (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY task_evidence_submissions_update
  ON public.task_evidence_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_evidence_submissions.task_id AND t.created_by = auth.uid()
    )
  );

-- Task Issues - Provider can create/view own, Manager can view all for their tasks
CREATE POLICY task_issues_view
  ON public.task_issues FOR SELECT
  USING (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_issues.task_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY task_issues_insert
  ON public.task_issues FOR INSERT
  WITH CHECK (
    provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1)
  );

CREATE POLICY task_issues_update
  ON public.task_issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_issues.task_id AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- 9. HELPER VIEWS FOR REPORTING
-- ============================================================================

-- View: Task reports with progress summary
CREATE OR REPLACE VIEW public.task_reports_summary AS
SELECT
  tr.id,
  tr.task_id,
  tr.provider_id,
  tr.status,
  tr.percentage_complete,
  t.title,
  t.priority,
  up.first_name || ' ' || up.last_name AS provider_name,
  (SELECT COUNT(*) FROM task_report_checklist_items WHERE report_id = tr.id) AS total_checklist_items,
  (SELECT COUNT(*) FROM task_report_checklist_items WHERE report_id = tr.id AND is_completed = true) AS completed_checklist_items,
  (SELECT COUNT(*) FROM task_evidence_submissions WHERE task_id = tr.task_id AND approved_at IS NULL) AS pending_evidence_count,
  (SELECT COUNT(*) FROM task_issues WHERE task_id = tr.task_id AND status = 'open') AS open_issues_count,
  tr.created_at,
  tr.updated_at
FROM task_reports tr
JOIN tasks t ON t.id = tr.task_id
JOIN user_profiles up ON up.id = tr.provider_id;

-- View: Flagged tasks (those with open critical/high severity issues)
CREATE OR REPLACE VIEW public.flagged_tasks AS
SELECT DISTINCT
  t.id,
  t.title,
  t.priority,
  ti.severity,
  COUNT(CASE WHEN ti.status = 'open' THEN 1 END) AS open_issues,
  MAX(ti.created_at) AS latest_issue_date
FROM tasks t
JOIN task_issues ti ON ti.task_id = t.id
WHERE ti.status = 'open' AND ti.severity IN ('high', 'critical')
GROUP BY t.id, t.title, t.priority, ti.severity
ORDER BY ti.severity DESC, ti.created_at DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 7 new tables created with proper constraints and indexes
-- RLS policies in place for security
-- Helper views created for reporting
-- All relationships properly defined
-- Triggers for updated_at fields
-- ============================================================================
