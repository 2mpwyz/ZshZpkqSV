-- ============================================================================
-- REPORTS FEATURE SAMPLE DATA
-- ============================================================================
-- This script provides production-ready sample data for testing the Reports feature
-- Run reports_feature_schema.sql FIRST before running this script
--
-- INSTRUCTIONS:
-- 1. Get your actual user IDs by running these queries in Supabase SQL editor:
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
-- 2. Find a task to use:
-- SELECT id, title, description, status, budget, created_by, assigned_to
-- FROM tasks
-- WHERE assigned_to IS NOT NULL AND status IN ('todo', 'in_progress')
-- LIMIT 1;
--
-- 3. Replace the placeholder values below with actual IDs
-- 4. Execute this script
--
-- ============================================================================

-- ============================================================================
-- SETUP: Get or create sample data with actual IDs
-- ============================================================================

DO $$
DECLARE
 -- REPLACE THESE WITH ACTUAL IDs FROM YOUR DATABASE
 -- Get these by running the queries above first
 v_manager_profile_id UUID;
 v_manager_user_id UUID;
 v_provider_profile_id UUID;
 v_provider_user_id UUID;
 v_task_id UUID;
 v_checklist_id UUID;
 v_report_id UUID;
 v_checklist_item_id_1 UUID;
 v_checklist_item_id_2 UUID;

BEGIN
 -- ========================================================================
 -- PART 1: Get actual IDs from database
 -- ========================================================================
 
 -- Get manager IDs
 SELECT id, user_id INTO v_manager_profile_id, v_manager_user_id
 FROM user_profiles 
 WHERE role = 'manager' 
 LIMIT 1;
 
 IF v_manager_profile_id IS NULL THEN
 RAISE EXCEPTION 'No manager profile found. Create a manager user first.';
 END IF;
 
 RAISE NOTICE 'Found manager: % (user: %)', v_manager_profile_id, v_manager_user_id;
 
 -- Get service provider IDs
 SELECT id, user_id INTO v_provider_profile_id, v_provider_user_id
 FROM user_profiles 
 WHERE role = 'service_provider' 
 LIMIT 1;
 
 IF v_provider_profile_id IS NULL THEN
 RAISE EXCEPTION 'No service provider profile found. Create a service provider user first.';
 END IF;
 
 RAISE NOTICE 'Found provider: % (user: %)', v_provider_profile_id, v_provider_user_id;
 
 -- Get an existing task or create one
 SELECT id INTO v_task_id 
 FROM tasks 
 WHERE assigned_to = v_provider_profile_id 
 AND status IN ('todo', 'in_progress')
 LIMIT 1;
 
 IF v_task_id IS NULL THEN
 -- Create a sample task for demonstration
 INSERT INTO tasks (
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
 'Suite Renovation - Premium Room 305',
 'Complete renovation of Suite 305 including painting, fixture installation, and flooring replacement.',
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
 ELSE
 RAISE NOTICE 'Using existing task: %', v_task_id;
 END IF;

 -- ========================================================================
 -- PART 2: CREATE CHECKLIST FOR THE TASK
 -- ========================================================================
 
 -- Check if checklist already exists
 SELECT id INTO v_checklist_id
 FROM task_checklists
 WHERE task_id = v_task_id
 LIMIT 1;
 
 IF v_checklist_id IS NULL THEN
 INSERT INTO task_checklists (
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
 
 INSERT INTO task_checklist_items (checklist_id, label, description, display_order)
 VALUES
 (v_checklist_id, 'Prepare walls - patch and sand', 'Fill holes, sand surface smooth, prepare for paint', 1),
 (v_checklist_id, 'Paint walls with base coat', 'Apply first coat of navy blue paint', 2),
 (v_checklist_id, 'Paint walls with finish coat', 'Apply second coat ensuring even coverage', 3),
 (v_checklist_id, 'Install ceiling light fixture', 'Install brass ceiling fixture with LED bulbs', 4),
 (v_checklist_id, 'Install wall sconces', 'Install wall-mounted sconces on accent wall', 5),
 (v_checklist_id, 'Remove old flooring', 'Carefully remove existing carpet and padding', 6),
 (v_checklist_id, 'Install marble tile flooring', 'Install new marble tile with proper grout lines', 7),
 (v_checklist_id, 'Final cleanup and inspection', 'Remove dust and debris, perform quality check', 8);

 RAISE NOTICE 'Created 8 checklist items';
 
 -- Get first two items for marking complete
 SELECT id INTO v_checklist_item_id_1
 FROM task_checklist_items
 WHERE checklist_id = v_checklist_id
 ORDER BY display_order
 LIMIT 1;
 
 SELECT id INTO v_checklist_item_id_2
 FROM task_checklist_items
 WHERE checklist_id = v_checklist_id
 ORDER BY display_order
 OFFSET 1 LIMIT 1;
 
 ELSE
 RAISE NOTICE 'Checklist already exists: %', v_checklist_id;
 END IF;

 -- ========================================================================
 -- PART 4: SET EVIDENCE REQUIREMENTS
 -- ========================================================================
 
 -- Check if evidence requirements already exist
 IF NOT EXISTS (
 SELECT 1 FROM task_evidence_requirements WHERE task_id = v_task_id
 ) THEN
 INSERT INTO task_evidence_requirements (
 task_id,
 required_evidence_types,
 description
 )
 VALUES (
 v_task_id,
 ARRAY['photo', 'video'],
 'Provider must submit: (1) photos from multiple angles, (2) time-lapse video of work'
 );
 
 RAISE NOTICE 'Set evidence requirements: photos and video';
 ELSE
 RAISE NOTICE 'Evidence requirements already set';
 END IF;

 -- ========================================================================
 -- PART 5: CREATE PROGRESS REPORT FROM PROVIDER
 -- ========================================================================
 
 -- Check if report already exists
 IF NOT EXISTS (
 SELECT 1 FROM task_reports WHERE task_id = v_task_id
 ) THEN
 INSERT INTO task_reports (
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
 'Day 1: Completed wall preparation (patching, sanding). Walls smooth and ready for paint. Day 2: Applied base coat to all walls. Color looks excellent. Day 3: Finishing second coat now.',
 35,
 v_provider_user_id
 )
 RETURNING id INTO v_report_id;
 
 RAISE NOTICE 'Created progress report: % (35%% complete)', v_report_id;
 
 -- Mark completed checklist items
 IF v_checklist_item_id_1 IS NOT NULL THEN
 INSERT INTO task_report_checklist_items (
 report_id,
 checklist_item_id,
 is_completed,
 completed_at
 )
 VALUES
 (v_report_id, v_checklist_item_id_1, true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
 (v_report_id, v_checklist_item_id_2, true, CURRENT_TIMESTAMP - INTERVAL '1 day');
 
 RAISE NOTICE 'Marked 2 checklist items as completed';
 END IF;
 
 ELSE
 RAISE NOTICE 'Report already exists for this task';
 END IF;

 -- ========================================================================
 -- PART 6: RAISE AN ISSUE TO DEMONSTRATE FLAGGING
 -- ========================================================================
 
 -- Check if issue already exists
 IF NOT EXISTS (
 SELECT 1 FROM task_issues WHERE task_id = v_task_id AND status = 'open'
 ) THEN
 INSERT INTO task_issues (
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
 'Custom marble tiles delayed by 1-2 days. Will push flooring installation back. Requesting timeline adjustment.',
 'high',
 'open'
 );

 RAISE NOTICE 'Created sample issue - task is now flagged for manager attention';
 ELSE
 RAISE NOTICE 'Issue already exists for this task';
 END IF;

 -- ========================================================================
 -- SUMMARY
 -- ========================================================================
 
 RAISE NOTICE '';
 RAISE NOTICE '========== SAMPLE DATA CONFIGURED ==========';
 RAISE NOTICE 'Task ID: %', v_task_id;
 RAISE NOTICE 'Checklist ID: %', v_checklist_id;
 RAISE NOTICE 'Manager: %', v_manager_profile_id;
 RAISE NOTICE 'Service Provider: %', v_provider_profile_id;
 RAISE NOTICE '';
 RAISE NOTICE 'Data includes:';
 RAISE NOTICE '1. Checklist with 8 items';
 RAISE NOTICE '2. Evidence requirements (photos + video)';
 RAISE NOTICE '3. Progress report (35%% complete)';
 RAISE NOTICE '4. 2 completed checklist items';
 RAISE NOTICE '5. Flagged issue (HIGH severity)';
 RAISE NOTICE '';
 RAISE NOTICE 'Use task ID above to test Reports tab.';
 RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the sample data was created:

-- View checklist items
-- SELECT ci.label, ci.description, ci.display_order
-- FROM task_checklist_items ci
-- JOIN task_checklists tc ON tc.id = ci.checklist_id
-- WHERE tc.task_id = '{v_task_id}'
-- ORDER BY ci.display_order;

-- View reports with percentage
-- SELECT percentage_complete, status, description
-- FROM task_reports
-- WHERE task_id = '{v_task_id}'
-- ORDER BY created_at DESC;

-- View open issues
-- SELECT title, description, severity, created_at
-- FROM task_issues
-- WHERE task_id = '{v_task_id}' AND status = 'open';
