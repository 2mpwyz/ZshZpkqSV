-- ===================================================================
-- NEGOTIATION CHAT SCHEMA MIGRATIONS
-- ===================================================================
-- This migration adds the necessary tables and enhancements to support
-- the negotiation chat feature while reusing existing infrastructure.
--
-- Key Points:
-- 1. task_messages table already exists - reusing it
-- 2. task_message_attachments junction table needed (NEW)
-- 3. task_negotiation_status table already exists - will be enhanced
-- 4. All foreign keys properly reference user_profiles or auth.users as appropriate
-- ===================================================================

-- ===================================================================
-- 1. CREATE task_message_attachments JUNCTION TABLE
-- ===================================================================
-- This table links messages to attachments (similar to complaint_attachments and task_attachments)
-- Purpose: Track which attachments are associated with each message in the negotiation chat

CREATE TABLE IF NOT EXISTS public.task_message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  attachment_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT task_message_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT task_message_attachments_unique UNIQUE (message_id, attachment_id),
  CONSTRAINT task_message_attachments_message_id_fkey
    FOREIGN KEY (message_id) REFERENCES task_messages (id) ON DELETE CASCADE,
  CONSTRAINT task_message_attachments_attachment_id_fkey
    FOREIGN KEY (attachment_id) REFERENCES attachments (id) ON DELETE CASCADE
);

-- Create indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_task_message_attachments_message_id
  ON public.task_message_attachments USING btree (message_id);

CREATE INDEX IF NOT EXISTS idx_task_message_attachments_attachment_id
  ON public.task_message_attachments USING btree (attachment_id);

-- ===================================================================
-- 2. ENHANCE task_negotiation_status TABLE
-- ===================================================================
-- Add additional fields to track negotiation metadata
-- Current fields are sufficient but adding comments for clarity

COMMENT ON TABLE public.task_negotiation_status IS 
  'Tracks the negotiation state for each task. Stores final agreed terms when negotiation concludes.';

COMMENT ON COLUMN public.task_negotiation_status.status IS 
  'Status of negotiation: pending, negotiating, finalized, or failed';

COMMENT ON COLUMN public.task_negotiation_status.final_price IS 
  'Final agreed price after negotiation. Matches todo_list details.budget when finalized.';

COMMENT ON COLUMN public.task_negotiation_status.final_timeline IS 
  'Final agreed timeline. Stored in todo_list details.timeline when finalized.';

COMMENT ON COLUMN public.task_negotiation_status.final_notes IS 
  'Final agreed notes/conditions. Stored in todo_list details.negotiation_notes when finalized.';

-- ===================================================================
-- 3. ENSURE task_messages STRUCTURE (Already exists)
-- ===================================================================
-- The task_messages table is already correct:
-- - id: UUID primary key
-- - task_id: FK to tasks
-- - sender_id: FK to auth.users
-- - sender_role: 'manager' | 'service_provider'
-- - message_text: TEXT
-- - attachments: JSONB (currently storing array - will be deprecated in favor of junction table)
-- - is_read: BOOLEAN
-- - created_at, updated_at: TIMESTAMP
--
-- Note: The attachments JSONB field will be kept for backward compatibility,
-- but new attachments should use task_message_attachments junction table.

-- ===================================================================
-- 4. ENSURE task_proposals STRUCTURE (Already exists)
-- ===================================================================
-- The task_proposals table is already correct:
-- - id: UUID primary key
-- - task_id: FK to tasks
-- - provider_id: FK to user_profiles (service provider)
-- - manager_id: FK to auth.users (manager)
-- - status: 'pending' | 'accepted' | 'declined' | 'counter_proposed'
-- - quoted_price: NUMERIC(12,2)
-- - proposal_notes: TEXT
-- - proposed_timeline: VARCHAR(100)
-- - attachments: JSONB
-- - created_at, updated_at: TIMESTAMP

-- ===================================================================
-- 5. ENSURE todo_list STRUCTURE (Already exists)
-- ===================================================================
-- The todo_list table is already correct:
-- - id: UUID primary key
-- - task_id: FK to tasks
-- - provider_id: FK to user_profiles (NOT auth.users - IMPORTANT!)
-- - status: 'pending' | 'in_progress' | 'completed'
-- - title: VARCHAR(255)
-- - description: TEXT
-- - priority: VARCHAR(20)
-- - due_date: DATE
-- - estimated_hours: NUMERIC(5,2)
-- - details: JSONB (stores negotiation details including budget, timeline, notes)
-- - attachments: JSONB (deprecated in favor of junction table)
-- - created_at, completed_at, updated_at: TIMESTAMP
--
-- CRITICAL: provider_id must be from user_profiles.id, NOT auth.users.id
-- This is where the 409 FK constraint error occurs if not done correctly.

-- ===================================================================
-- 6. CREATE INDEXES FOR NEGOTIATION QUERIES
-- ===================================================================
-- These indexes optimize common negotiation-related queries

CREATE INDEX IF NOT EXISTS idx_task_proposals_status_active
  ON public.task_proposals USING btree (status)
  WHERE status IN ('pending', 'counter_proposed');

CREATE INDEX IF NOT EXISTS idx_task_messages_task_id_created_at
  ON public.task_messages USING btree (task_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_negotiation_status_status
  ON public.task_negotiation_status USING btree (status);

-- ===================================================================
-- 7. HELPFUL VIEWS FOR NEGOTIATION
-- ===================================================================

-- View: Active negotiations with unread message counts
CREATE OR REPLACE VIEW public.negotiation_threads AS
SELECT
  tp.id AS proposal_id,
  tp.task_id,
  tp.provider_id,
  tp.manager_id,
  tp.status,
  tp.quoted_price,
  tp.proposed_timeline,
  tp.proposal_notes,
  COUNT(tm.id) FILTER (WHERE NOT tm.is_read) AS unread_message_count,
  MAX(tm.created_at) AS last_message_at,
  tns.final_price,
  tns.final_timeline,
  tns.final_notes,
  tns.status AS negotiation_status
FROM task_proposals tp
LEFT JOIN task_messages tm ON tp.task_id = tm.task_id
LEFT JOIN task_negotiation_status tns ON tp.task_id = tns.task_id
GROUP BY tp.id, tp.task_id, tp.provider_id, tp.manager_id, tp.status,
  tp.quoted_price, tp.proposed_timeline, tp.proposal_notes,
  tns.final_price, tns.final_timeline, tns.final_notes, tns.status;

-- ===================================================================
-- 8. TRIGGER: Update negotiation status when proposal is accepted
-- ===================================================================

CREATE OR REPLACE FUNCTION public.on_proposal_finalized()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Update negotiation status
    INSERT INTO task_negotiation_status (
      task_id,
      status,
      current_proposal_id,
      final_price,
      final_timeline,
      final_notes
    )
    VALUES (
      NEW.task_id,
      'finalized',
      NEW.id,
      NEW.quoted_price,
      NEW.proposed_timeline,
      NEW.proposal_notes
    )
    ON CONFLICT (task_id) DO UPDATE SET
      status = 'finalized',
      current_proposal_id = NEW.id,
      final_price = NEW.quoted_price,
      final_timeline = NEW.proposed_timeline,
      final_notes = NEW.proposal_notes,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it has a different implementation
DROP TRIGGER IF EXISTS on_proposal_finalized_update_status 
  ON public.task_proposals;

-- Create the trigger
CREATE TRIGGER on_proposal_finalized_update_status
AFTER UPDATE OF status ON public.task_proposals
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION public.on_proposal_finalized();

-- ===================================================================
-- 9. GRANTS & ROW LEVEL SECURITY (RLS)
-- ===================================================================
-- Ensure proper access control for negotiation tables

-- Enable RLS on task_message_attachments
ALTER TABLE public.task_message_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view message attachments for their own tasks
CREATE POLICY task_message_attachments_view_policy
  ON public.task_message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_messages tm
      WHERE tm.id = task_message_attachments.message_id
      AND (
        tm.sender_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM task_proposals tp
          WHERE tp.task_id = tm.task_id
          AND (
            tp.provider_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
            OR tp.manager_id = auth.uid()
          )
        )
      )
    )
  );

-- ===================================================================
-- MIGRATION SUMMARY
-- ===================================================================
-- Tables created:
--   ✓ task_message_attachments (NEW - junction table for message attachments)
--
-- Tables enhanced/configured:
--   ✓ task_negotiation_status (enhanced documentation)
--   ✓ task_messages (already exists - reusing)
--   ✓ task_proposals (already exists - reusing)
--   ✓ todo_list (already exists - reusing)
--
-- Views created:
--   ✓ negotiation_threads (query helper for active negotiations)
--
-- Functions/Triggers created:
--   ✓ on_proposal_finalized() - auto-update negotiation status
--
-- CRITICAL REMINDERS:
--   ⚠️  provider_id in todo_list MUST reference user_profiles.id, NOT auth.users.id
--   ⚠️  Ensure currentUserProfile.id is used when creating todos, not currentUser.id
--   ⚠️  Message attachments can use JSONB or junction table - recommend junction for consistency
