-- ============================================================================
-- REPORTS FEATURE SAMPLE DATA
-- ============================================================================
-- This script provides production-ready sample data for testing the Reports feature
-- Run REPORTS_FEATURE_SQL_MIGRATION.sql FIRST before running this script
--
-- INSTRUCTIONS:
-- 1. First, identify real user IDs in your system by running these queries:
--
-- SELECT id, user_id, email, first_name, last_name, role 
-- FROM user_profiles 
-- WHERE role = 'manager' 
-- LIMIT 1;
--
-- SELECT id, user_id, email, first_name, last_name, role 
-- FROM user_profiles 
-- WHERE role = 'service_provider' 
-- LIMIT 1;
--
-- SELECT id, title, description, status, budget, created_by
-- FROM tasks
-- LIMIT 1;
--
-- 2. Replace the placeholder values in the section below with actual IDs
-- 3. Execute this script
--
-- ============================================================================

-- ============================================================================
-- SETUP: Declare variables with your actual IDs
-- ============================================================================
-- CUSTOMIZE THESE VALUES with real IDs from your database:

-- Scenario: John Smith (Manager) created a Room Renovation task assigned to 
-- Maria Rodriguez (Service Provider)

DO $$
DECLARE
  -- REPLACE THESE WITH ACTUAL IDs FROM YOUR DATABASE
  v_manager_profile_id UUID := (SELECT id FROM user_profiles WHERE role = 'manager' LIMIT 1);
  v_manager_user_id UUID := (SELECT user_id FROM user_profiles WHERE role = 'manager' LIMIT 1);
  v_provider_profile_id UUID := (SELECT id FROM user_profiles WHERE role = 'service_provider' LIMIT 1);
  v_provider_user_id UUID := (SELECT user_id FROM user_profiles WHERE role = 'service_provider' LIMIT 1);
  v_task_id UUID;
  v_checklist_id UUID;
  v_report_id UUID;
  v_attachment_id UUID;

BEGIN
  -- Verify we have valid IDs
  IF v_manager_profile_id IS NULL THEN
    RAISE EXCEPTION 'No manager profile found. Create a manager user first.';
  END IF;
  
  IF v_provider_profile_id IS NULL THEN
    RAISE EXCEPTION 'No service provider profile found. Create a service provider user first.';
  END IF;

  -- ========================================================================
  -- PART 1: CREATE A SAMPLE TASK (if not already exists)
  -- ========================================================================
  
  -- Use existing task or create new one
  SELECT id INTO v_task_id FROM tasks 
  WHERE assigned_to = v_provider_profile_id AND status = 'todo' 
  LIMIT 1;
  
  IF v_task_id IS NULL THEN
    -- Create sample task
    INSERT INTO public.tasks (
      title,
      description,
      priority,
      status,
      category,
      assigned_to,
      assignee_name,
      assigned_category,
      due_date,
      estimated_time,
      payment_terms,
      budget,
      created_by,
      is_from_complaint
    )
    SELECT
      'Deluxe Room Renovation - Suite 305',
      'Complete renovation of Suite 305 including wall painting, fixture installation, and flooring replacement. Guest requested specific color scheme and materials.',
      'high',
      'in_progress',
      'service',
      v_provider_profile_id,
      (SELECT first_name || ' ' || last_name FROM user_profiles WHERE id = v_provider_profile_id),
      'internal',
      CURRENT_DATE + INTERVAL '7 days',
      '16-20 hours',
      'Upon completion and approval',
      2500.00,
      v_manager_user_id,
      false
    RETURNING id INTO v_task_id;
    
    RAISE NOTICE 'Created new sample task: %', v_task_id;
  END IF;

  -- ========================================================================
  -- PART 2: CREATE CHECKLIST FOR THE TASK
  -- ========================================================================
  
  INSERT INTO public.task_checklists (
    task_id,
    title,
    description,
    is_required
  )
  VALUES (
    v_task_id,
    'Room Renovation Completion Checklist',
    'All items must be completed and verified before final approval',
    true
  )
  RETURNING id INTO v_checklist_id;
  
  RAISE NOTICE 'Created checklist: %', v_checklist_id;

  -- ========================================================================
  -- PART 3: ADD CHECKLIST ITEMS
  -- ========================================================================
  
  INSERT INTO public.task_checklist_items (checklist_id, label, description, display_order)
  VALUES
    (v_checklist_id, 'Prepare walls - patch and sand', 'Fill any holes, sand surface smooth, prepare for paint', 1),
    (v_checklist_id, 'Paint walls with base coat', 'Apply first coat of Sheraton Navy (color: #1a3a52)', 2),
    (v_checklist_id, 'Paint walls with finish coat', 'Apply second coat ensuring even coverage', 3),
    (v_checklist_id, 'Install new ceiling light fixture', 'Install brass ceiling fixture with LED bulbs', 4),
    (v_checklist_id, 'Install wall sconces', 'Install two wall-mounted sconces on accent wall', 5),
    (v_checklist_id, 'Remove old flooring', 'Carefully remove existing carpet and padding', 6),
    (v_checklist_id, 'Install marble tile flooring', 'Install new 12x24 marble tile with proper grout lines', 7),
    (v_checklist_id, 'Final cleanup and inspection', 'Remove all dust and debris, perform quality check', 8);

  RAISE NOTICE 'Created 8 checklist items';

  -- ========================================================================
  -- PART 4: SET EVIDENCE REQUIREMENTS
  -- ========================================================================
  
  INSERT INTO public.task_evidence_requirements (
    task_id,
    required_evidence_types,
    description
  )
  VALUES (
    v_task_id,
    ARRAY['photo', 'video'],
    'Provider must submit: (1) photos of completed work from multiple angles, (2) time-lapse video showing installation process'
  );
  
  RAISE NOTICE 'Set evidence requirements: photos and video';

  -- ========================================================================
  -- PART 5: CREATE PROGRESS REPORT FROM PROVIDER
  -- ========================================================================
  
  INSERT INTO public.task_reports (
    task_id,
    provider_id,
    status,
    description,
    percentage_complete,
    last_updated_by
  )
  VALUES (
    v_task_id,
    v_provider_profile_id,
    'in_progress',
    'Day 1: Completed wall preparation (patching, sanding). Walls are now smooth and ready for painting. Day 2: Applied base coat of paint to all walls. Color looks great. Day 3: Finishing second coat now.',
    35,
    v_provider_user_id
  )
  RETURNING id INTO v_report_id;
  
  RAISE NOTICE 'Created progress report: % (35%% complete)', v_report_id;

  -- ========================================================================
  -- PART 6: MARK COMPLETED CHECKLIST ITEMS
  -- ========================================================================
  
  INSERT INTO public.task_report_checklist_items (
    report_id,
    checklist_item_id,
    is_completed,
    completed_at
  )
  SELECT
    v_report_id,
    tci.id,
    true,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  FROM task_checklist_items tci
  WHERE tci.checklist_id = v_checklist_id
  AND tci.label IN (
    'Prepare walls - patch and sand',
    'Paint walls with base coat'
  );

  RAISE NOTICE 'Marked 2 checklist items as completed';

  -- ========================================================================
  -- PART 7: CREATE SAMPLE EVIDENCE SUBMISSIONS
  -- ========================================================================
  
  -- For demonstration, we'll create evidence submissions
  -- (Attach to existing attachments if available, or create placeholder)
  
  INSERT INTO public.task_evidence_submissions (
    task_id,
    provider_id,
    evidence_type,
    attachment_id,
    description,
    submitted_at,
    approved_at,
    approved_by
  )
  SELECT
    v_task_id,
    v_provider_profile_id,
    'photo',
    a.id,
    'Photo of wall preparation - all patching and sanding complete',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 days',
    v_manager_user_id
  FROM attachments a
  WHERE a.user_id = v_provider_user_id
  AND a.file_type = 'image'
  LIMIT 1;

  RAISE NOTICE 'Created evidence submissions (using existing attachments)';

  -- ========================================================================
  -- PART 8: RAISE AN ISSUE TO DEMONSTRATE FLAGGING
  -- ========================================================================
  
  INSERT INTO public.task_issues (
    task_id,
    provider_id,
    title,
    description,
    severity,
    status
  )
  VALUES (
    v_task_id,
    v_provider_profile_id,
    'Delayed marble tile delivery',
    'The custom marble tiles were supposed to arrive yesterday but carrier shows delivery delayed to tomorrow. This will push the flooring installation back by 1-2 days. Requesting timeline adjustment.',
    'high',
    'open'
  );

  RAISE NOTICE 'Created sample issue - task is now flagged for manager attention';

  -- ========================================================================
  -- PART 9: FINAL REPORT WITH ALL WORK COMPLETE
  -- ========================================================================
  
  -- Create another report entry showing task nearing completion
  INSERT INTO public.task_reports (
    task_id,
    provider_id,
    status,
    description,
    percentage_complete,
    last_updated_by
  )
  VALUES (
    v_task_id,
    v_provider_profile_id,
    'completed_pending_approval',
    'All work is now complete! Both walls are painted with perfect finish, all lighting fixtures installed and tested working properly, marble flooring installed with sealed grout. Room cleaned and ready for final inspection. Awaiting manager approval.',
    100,
    v_provider_user_id
  )
  RETURNING id INTO v_report_id;

  -- Mark all remaining checklist items as complete
  INSERT INTO public.task_report_checklist_items (
    report_id,
    checklist_item_id,
    is_completed,
    completed_at
  )
  SELECT
    v_report_id,
    tci.id,
    true,
    CURRENT_TIMESTAMP
  FROM task_checklist_items tci
  WHERE tci.checklist_id = v_checklist_id;

  RAISE NOTICE 'Created final report: 100%% complete, awaiting manager approval';

  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '========== SAMPLE DATA CREATED ==========';
  RAISE NOTICE 'Task ID: %', v_task_id;
  RAISE NOTICE 'Manager: %', v_manager_profile_id;
  RAISE NOTICE 'Service Provider: %', v_provider_profile_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Sample Scenario:';
  RAISE NOTICE '1. Task created with 8-item checklist';
  RAISE NOTICE '2. Evidence requirements set (photos + video)';
  RAISE NOTICE '3. Provider created progress report (35%% complete)';
  RAISE NOTICE '4. 2 checklist items marked complete';
  RAISE NOTICE '5. Evidence submission created (already approved)';
  RAISE NOTICE '6. Issue raised: marble tile delivery delayed (HIGH severity)';
  RAISE NOTICE '7. Final report created: 100%% complete, pending approval';
  RAISE NOTICE '';
  RAISE NOTICE 'Use task ID above to test Reports tab in your application.';
  RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- ADDITIONAL SAMPLE DATA: MULTI-TASK SCENARIOS
-- ============================================================================
-- The above creates one detailed scenario. For more comprehensive testing,
-- you can create additional sample tasks using this template:

/*

-- Create multiple tasks in different states for comprehensive testing
DO $$
DECLARE
  v_manager_id UUID := (SELECT user_id FROM user_profiles WHERE role = 'manager' LIMIT 1);
  v_provider_id UUID := (SELECT id FROM user_profiles WHERE role = 'service_provider' LIMIT 1);
  v_task_id UUID;
BEGIN

  -- SCENARIO 2: Task in early stage (just started)
  INSERT INTO tasks (title, description, priority, status, category, assigned_to, 
    assigned_category, due_date, budget, created_by, is_from_complaint)
  VALUES (
    'Plumbing Maintenance - Guest Room 210',
    'Replace worn pipes and fix leaking faucet in bathroom',
    'medium',
    'in_progress',
    'maintenance',
    v_provider_id,
    'internal',
    CURRENT_DATE + INTERVAL '3 days',
    800.00,
    v_manager_id,
    false
  ) RETURNING id INTO v_task_id;

  INSERT INTO task_reports (task_id, provider_id, status, description, 
    percentage_complete, last_updated_by)
  VALUES (
    v_task_id,
    v_provider_id,
    'in_progress',
    'Just started. Shut off water supply and removed old faucet.',
    10,
    (SELECT user_id FROM user_profiles WHERE id = v_provider_id)
  );

  -- SCENARIO 3: Task with critical issue
  INSERT INTO tasks (title, description, priority, status, category, assigned_to,
    assigned_category, due_date, budget, created_by, is_from_complaint)
  VALUES (
    'HVAC System Repair - Main Lobby',
    'Fix air conditioning unit not cooling properly',
    'urgent',
    'in_progress',
    'maintenance',
    v_provider_id,
    'external',
    CURRENT_DATE + INTERVAL '1 day',
    1500.00,
    v_manager_id,
    false
  ) RETURNING id INTO v_task_id;

  INSERT INTO task_issues (task_id, provider_id, title, description, 
    severity, status)
  VALUES (
    v_task_id,
    v_provider_id,
    'Compressor unit failure - needs replacement',
    'The compressor motor has failed and cannot be repaired. Full unit replacement needed but requires part special order (3-5 days). Estimated cost increase: $500.',
    'critical',
    'open'
  );

END $$;

*/

-- ============================================================================
-- QUERIES TO VERIFY SAMPLE DATA
-- ============================================================================
-- Use these queries to verify the sample data was created correctly:

-- View all sample tasks with reports
SELECT 
  t.id,
  t.title,
  t.status,
  tr.percentage_complete,
  tr.status as report_status,
  (SELECT COUNT(*) FROM task_checklist_items tci 
    JOIN task_report_checklist_items trci ON trci.checklist_item_id = tci.id
    WHERE trci.report_id = (
      SELECT id FROM task_reports WHERE task_id = t.id ORDER BY updated_at DESC LIMIT 1
    ) AND trci.is_completed = true) as completed_items,
  (SELECT COUNT(*) FROM task_checklist_items WHERE checklist_id = 
    (SELECT id FROM task_checklists WHERE task_id = t.id LIMIT 1)) as total_items,
  (SELECT COUNT(*) FROM task_issues WHERE task_id = t.id AND status = 'open') as open_issues
FROM tasks t
LEFT JOIN task_reports tr ON tr.task_id = t.id
WHERE t.status IN ('in_progress', 'in_review')
ORDER BY tr.updated_at DESC;

-- View all evidence submissions
SELECT 
  tes.id,
  t.title,
  tes.evidence_type,
  CASE WHEN tes.approved_at IS NOT NULL THEN 'APPROVED' ELSE 'PENDING' END as status,
  tes.submitted_at,
  tes.approved_at
FROM task_evidence_submissions tes
JOIN tasks t ON t.id = tes.task_id
ORDER BY tes.submitted_at DESC;

-- View all open issues (flagged tasks)
SELECT 
  ti.id,
  t.title,
  ti.title as issue_title,
  ti.severity,
  ti.created_at
FROM task_issues ti
JOIN tasks t ON t.id = ti.task_id
WHERE ti.status = 'open'
ORDER BY ti.severity DESC, ti.created_at DESC;

-- ============================================================================
-- NOTES FOR DEVELOPERS
-- ============================================================================
-- 
-- The sample data creates realistic scenarios:
-- 
-- 1. ACTIVE ROOM RENOVATION
--    - Complex task with multiple steps
--    - Shows progress tracking with percentages
--    - Demonstrates checklist completion
--    - Shows evidence requirements in action
--    - Includes both approved and submitted evidence
--    - Has a flagged issue (supplier delay)
--
-- 2. FEATURE COVERAGE
--    - Checklists: 8 items with 2 marked complete in first report, all in second
--    - Evidence: Photo evidence with approval workflow
--    - Issues: Critical issue demonstrating task flagging
--    - Reports: Two reports showing progress from 35% to 100%
--
-- 3. TESTING THE REPORTS TAB
--    - Manager should see all reports in real-time
--    - Provider should see their own reports
--    - Evidence approval workflow visible
--    - Flagged issue should be highlighted
--    - Checklist completion progress should show
--
-- 4. RLS TESTING
--    - Manager can see manager's own created tasks
--    - Provider can only see their assigned tasks
--    - Neither can see other users' data
--
-- ============================================================================
