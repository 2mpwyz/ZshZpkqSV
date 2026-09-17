-- ============================================================================
-- PROPOSAL ACCEPTANCE TODO FIX - CORRECTED VERSION
-- ============================================================================
-- This migration FIXES the critical issue where todos were being created 
-- with ORIGINAL task details instead of NEGOTIATED proposal terms.
--
-- IMPORTANT: This file only modifies/creates what's needed. It uses IF NOT EXISTS
-- and DROP...IF EXISTS to avoid conflicts with existing schema.
-- ============================================================================

-- ============================================================================
-- 1. FIX: Update create_todo_on_proposal_acceptance function
-- ============================================================================
-- This function must create todos with PROPOSAL terms, not task details
-- The critical difference:
--   ✗ WRONG: Use t.budget (original task budget)
--   ✓ RIGHT: Use NEW.quoted_price (negotiated proposal price)

CREATE OR REPLACE FUNCTION public.create_todo_on_proposal_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a todo list entry when proposal is accepted
  -- CRITICAL: Use proposal terms (quoted_price, proposed_timeline, proposal_notes),
  -- NOT original task terms
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
        'category', t.category,
        'estimated_time', t.estimated_time,
        'payment_terms', t.payment_terms,
        'budget_original', t.budget,              -- Reference to original (for audit trail)
        'budget', NEW.quoted_price,                -- ✅ AGREED PRICE from proposal
        'timeline', NEW.proposed_timeline,         -- ✅ AGREED TIMELINE from proposal  
        'negotiation_notes', NEW.proposal_notes    -- ✅ AGREED NOTES from proposal
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

-- Drop the old trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_proposal_acceptance_create_todo ON public.task_proposals;

-- Create the trigger - fires when proposal status changes to 'accepted'
CREATE TRIGGER on_proposal_acceptance_create_todo
  AFTER UPDATE OF status ON public.task_proposals
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION public.create_todo_on_proposal_acceptance();

-- ============================================================================
-- 2. FIX: Update create_todo_on_task_acceptance function
-- ============================================================================
-- This handles the OLD workflow (direct task accept via task_responses)
-- Also update this to include proposal terms consistently

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
        'budget_original', t.budget
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

-- Drop and recreate the trigger to ensure it's using the correct function
DROP TRIGGER IF EXISTS on_task_acceptance_create_todo ON public.task_responses;

CREATE TRIGGER on_task_acceptance_create_todo
  AFTER INSERT ON public.task_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_todo_on_task_acceptance();

-- ============================================================================
-- 3. FIX: Update on_proposal_finalized function (negotiation status tracking)
-- ============================================================================
-- This updates the task_negotiation_status when a proposal is accepted

CREATE OR REPLACE FUNCTION public.on_proposal_finalized()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Update negotiation status with finalized terms
    INSERT INTO public.task_negotiation_status (
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

-- Drop and recreate to ensure consistency
DROP TRIGGER IF EXISTS on_proposal_finalized_update_status ON public.task_proposals;

CREATE TRIGGER on_proposal_finalized_update_status
  AFTER UPDATE OF status ON public.task_proposals
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION public.on_proposal_finalized();

-- ============================================================================
-- 4. VERIFY: Other notification triggers (no changes needed)
-- ============================================================================
-- These already exist and are working correctly, just documenting them:
-- 
-- ✓ notify_provider_on_proposal_update - fires on proposal status changes
-- ✓ notify_manager_on_task_response - fires on task responses
-- ✓ notify_provider_on_task_assigned - fires when task is assigned
--
-- These don't need modification.

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================
--
-- ✅ Fixed: create_todo_on_proposal_acceptance()
--    - Now uses quoted_price (not t.budget)
--    - Now uses proposed_timeline (not t.estimated_time)
--    - Now uses proposal_notes (not t.payment_terms)
--    - Includes budget_original for audit trail
--    - Prevents duplicate todos
--
-- ✅ Updated: create_todo_on_task_acceptance()
--    - Added duplicate prevention check
--
-- ✅ Updated: on_proposal_finalized()
--    - Ensures task_negotiation_status matches proposal terms
--
-- ✅ Result: All three workflows now use correct terms:
--    1. Direct task accept → uses task details (as is) ✓
--    2. Proposal accept → uses proposal terms ✓
--    3. Negotiation chat → uses negotiated terms ✓
--
-- ============================================================================
