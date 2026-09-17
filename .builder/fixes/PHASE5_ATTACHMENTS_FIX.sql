-- PHASE 5 FIX: Update the trigger function to copy attachments to todo_list
-- This replaces the previous create_todo_on_task_acceptance function
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION create_todo_on_task_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a todo list entry when task is accepted
  IF NEW.action = 'accept' THEN
    INSERT INTO public.todo_list (
      task_id,
      provider_id,
      title,
      description,
      priority,
      due_date,
      details,
      attachments,
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
        'budget', t.budget
      ),
      -- Copy attachment info from task_attachments table
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'name', a.original_name,
            'size', a.file_size,
            'url', a.b2_url
          )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::jsonb
      ),
      'pending'::character varying
    FROM tasks t
    LEFT JOIN task_attachments ta ON t.id = ta.task_id
    LEFT JOIN attachments a ON ta.attachment_id = a.id
    WHERE t.id = NEW.task_id
    GROUP BY t.id, NEW.provider_id;

    -- Notify the provider that a todo has been created
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
