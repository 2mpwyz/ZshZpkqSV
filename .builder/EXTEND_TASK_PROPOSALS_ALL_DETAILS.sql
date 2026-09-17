-- ============================================================================
-- EXTEND TASK_PROPOSALS TO CAPTURE ALL NEGOTIABLE DETAILS
-- ============================================================================
-- This incremental patch adds columns to task_proposals table to store
-- negotiated values for category, estimated_time, and payment_terms.
-- 
-- This ensures the todo captures the FINAL AGREED TERMS for ALL fields,
-- not just budget, timeline, and notes.
-- ============================================================================

-- ============================================================================
-- 1. EXTEND task_proposals TABLE - Add new negotiable detail columns
-- ============================================================================
-- These columns will store the negotiated values for fields that can change

ALTER TABLE public.task_proposals
ADD COLUMN IF NOT EXISTS proposed_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS proposed_estimated_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS proposed_payment_terms TEXT;

-- Add constraints to match the task table constraints
ALTER TABLE public.task_proposals
ADD CONSTRAINT task_proposals_proposed_category_check CHECK (
  proposed_category IS NULL OR proposed_category::text = ANY (
    ARRAY[
      'operations'::character varying,
      'service'::character varying,
      'training'::character varying,
      'maintenance'::character varying
    ]::text[]
  )
);

-- ============================================================================
-- 2. UPDATE create_todo_on_proposal_acceptance FUNCTION
-- ============================================================================
-- This function now uses ALL negotiated details from the proposal

CREATE OR REPLACE FUNCTION public.create_todo_on_proposal_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a todo list entry when proposal is accepted
  -- CRITICAL: Use ALL proposal terms, not task details
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO public.todo_list (
      task_id,
      provider_id,
      title,
      description,
      priority,
      due_date,
      details,
      status
    )
    SELECT
      t.id,
      NEW.provider_id,
      t.title,
      t.description,
      t.priority,
      t.due_date,
      jsonb_build_object(
        -- Original task fields (for reference/audit)
        'category_original', t.category,
        'estimated_time_original', t.estimated_time,
        'payment_terms_original', t.payment_terms,
        'budget_original', t.budget,
        
        -- AGREED NEGOTIATED FIELDS ✅
        'category', COALESCE(NEW.proposed_category, t.category),              -- Use negotiated or default to original
        'estimated_time', COALESCE(NEW.proposed_estimated_time, t.estimated_time),  -- Use negotiated or default to original
        'payment_terms', COALESCE(NEW.proposed_payment_terms, t.payment_terms),     -- Use negotiated or default to original
        'budget', NEW.quoted_price,                                            -- AGREED PRICE ✅
        'timeline', NEW.proposed_timeline,                                    -- AGREED TIMELINE ✅
        'negotiation_notes', NEW.proposal_notes                               -- AGREED NOTES ✅
      ),
      'pending'::character varying
    FROM tasks t
    WHERE t.id = NEW.task_id
    AND NOT EXISTS (
      -- Prevent duplicate todos for same task+provider
      SELECT 1 FROM todo_list tl
      WHERE tl.task_id = NEW.task_id AND tl.provider_id = NEW.provider_id
    );

    -- Notify provider that proposal was accepted and todo created
    INSERT INTO public.notifications (user_id, task_id, type, message)
    SELECT 
      up.user_id,
      NEW.task_id,
      'proposal_accepted'::character varying,
      'Your proposal has been accepted! Check your todo list for the agreed terms.'
    FROM user_profiles up
    WHERE up.id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. UPDATE create_todo_on_task_acceptance FUNCTION
-- ============================================================================
-- For consistency, also update the old workflow function

CREATE OR REPLACE FUNCTION public.create_todo_on_task_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a todo list entry when task response is 'accept'
  IF NEW.action = 'accept' THEN
    INSERT INTO public.todo_list (
      task_id,
      provider_id,
      title,
      description,
      priority,
      due_date,
      details,
      status
    )
    SELECT
      t.id,
      NEW.provider_id,
      t.title,
      t.description,
      t.priority,
      t.due_date,
      jsonb_build_object(
        'category', t.category,
        'estimated_time', t.estimated_time,
        'payment_terms', t.payment_terms,
        'budget', t.budget,
        'budget_original', t.budget,
        'category_original', t.category,
        'estimated_time_original', t.estimated_time,
        'payment_terms_original', t.payment_terms
      ),
      'pending'::character varying
    FROM tasks t
    WHERE t.id = NEW.task_id
    AND NOT EXISTS (
      -- Prevent duplicate todos for same task+provider
      SELECT 1 FROM todo_list tl
      WHERE tl.task_id = NEW.task_id AND tl.provider_id = NEW.provider_id
    );

    -- Notify provider that a todo has been created
    INSERT INTO public.notifications (user_id, task_id, type, message)
    SELECT 
      up.user_id,
      NEW.task_id,
      'todo_created'::character varying,
      'A todo list entry has been created for your accepted task'
    FROM user_profiles up
    WHERE up.id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the triggers are attached correctly (no recreation needed if already exist)
-- The trigger functions are already in place from PROPOSAL_ACCEPTANCE_FIX.sql

-- ============================================================================
-- 4. OPTIONAL: Add indexes for new columns to optimize queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_task_proposals_proposed_category
  ON public.task_proposals USING btree (proposed_category);

CREATE INDEX IF NOT EXISTS idx_task_proposals_proposed_estimated_time
  ON public.task_proposals USING btree (proposed_estimated_time);

-- ============================================================================
-- SUMMARY
-- ============================================================================
--
-- ✅ Extended task_proposals with 3 new columns:
--    - proposed_category
--    - proposed_estimated_time
--    - proposed_payment_terms
--
-- ✅ Updated create_todo_on_proposal_acceptance() to:
--    - Use negotiated category OR fall back to original
--    - Use negotiated estimated_time OR fall back to original
--    - Use negotiated payment_terms OR fall back to original
--    - Store original values for audit trail (*_original fields)
--
-- ✅ Result: Todo now captures ALL final agreed details:
--    {
--      "category": "negotiated_category",  // ✅
--      "estimated_time": "negotiated_time",  // ✅
--      "payment_terms": "negotiated_terms",  // ✅
--      "budget": "negotiated_price",  // ✅
--      "timeline": "negotiated_timeline",  // ✅
--      "negotiation_notes": "agreed_notes",  // ✅
--      "category_original": "original_category",  // Audit trail
--      "estimated_time_original": "original_time",  // Audit trail
--      "payment_terms_original": "original_terms",  // Audit trail
--      "budget_original": "original_budget"  // Audit trail
--    }
--
-- ============================================================================
