-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES TABLE (Multi-tenant with roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'manager', 'service_provider')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  room_number VARCHAR(10),
  service_type VARCHAR(100),
  service_category VARCHAR(50) CHECK (service_category IN ('internal', 'external')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================================================
-- COMPLAINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  room_number VARCHAR(10) NOT NULL,
  complaint_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_email ON public.complaints(email);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- ============================================================================
-- ENABLE RLS AND DROP OLD POLICIES
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Managers can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Anyone can submit complaint" ON public.complaints;
DROP POLICY IF EXISTS "Users can update own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Managers can read all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Managers can update all complaints" ON public.complaints;

-- ============================================================================
-- CREATE RLS POLICIES FOR USER PROFILES
-- ============================================================================
-- Allow all authenticated users to read all profiles (needed for task assignment dropdowns)
CREATE POLICY "Authenticated users can read all profiles" ON public.user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (during signup via trigger)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CREATE RLS POLICIES FOR COMPLAINTS
-- ============================================================================
-- Public: Anyone can submit a complaint (no auth required)
CREATE POLICY "Anyone can submit complaint" ON public.complaints
  FOR INSERT
  WITH CHECK (true);

-- Users can read their own complaints
CREATE POLICY "Users can read own complaints" ON public.complaints
  FOR SELECT
  USING (user_id = auth.uid() OR email = auth.jwt() ->> 'email');

-- Users can update their own complaints
CREATE POLICY "Users can update own complaints" ON public.complaints
  FOR UPDATE
  USING (user_id = auth.uid());

-- Authenticated users can read all complaints (for managers to see all complaints)
CREATE POLICY "Authenticated users can read all complaints" ON public.complaints
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can update all complaints (for managers to update status)
CREATE POLICY "Authenticated users can update all complaints" ON public.complaints
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- AUTOMATIC PROFILE CREATION ON SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    'guest',
    '',
    ''
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATED_AT TIMESTAMP FUNCTION AND TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE COMPLAINTS DATA
-- ============================================================================
INSERT INTO public.complaints (
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  NULL,
  'John Doe',
  'john.doe@example.com',
  '301',
  'Maintenance Issue',
  'The air conditioning in room 301 is not working properly.',
  'urgent',
  'open',
  '[]'::jsonb,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
  NULL,
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '205',
  'Cleanliness',
  'The bathroom had not been properly cleaned when we checked in.',
  'high',
  'in_progress',
  '[]'::jsonb,
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '1 hour'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
  NULL,
  'Michael Chen',
  'michael.chen@example.com',
  '420',
  'Noise/Disturbance',
  'There was excessive noise coming from the adjacent room late into the evening.',
  'medium',
  'resolved',
  '[]'::jsonb,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.complaints (
  id, user_id, guest_name, email, room_number, complaint_type, description, priority, status, attachments, created_at, updated_at
) VALUES (
  'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4',
  NULL,
  'Emma Wilson',
  'emma.wilson@example.com',
  '315',
  'Missing Items',
  'The room was missing several amenities that are typically provided.',
  'low',
  'resolved',
  '[]'::jsonb,
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '12 hours'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TASKS TABLE (For manager task management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed')),
  category VARCHAR(50) CHECK (category IN ('operations', 'service', 'training', 'maintenance')),
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  assignee_name VARCHAR(255),
  assigned_category VARCHAR(50) CHECK (assigned_category IN ('internal', 'external')),
  due_date DATE,
  estimated_time VARCHAR(50),
  payment_terms TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_complaint_id ON public.tasks(complaint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('complaint_filed', 'task_created', 'task_updated', 'task_assigned')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_complaint_id ON public.notifications(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON public.notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================================
-- ENABLE RLS ON TASKS AND NOTIFICATIONS
-- ============================================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can read all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Service providers can read assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- ============================================================================
-- RLS POLICIES FOR TASKS
-- ============================================================================
-- Authenticated users can read all tasks
CREATE POLICY "Authenticated users can read all tasks" ON public.tasks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create tasks
CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update all tasks
CREATE POLICY "Authenticated users can update all tasks" ON public.tasks
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System/triggers can insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- TASKS UPDATED_AT TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTIFICATION TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_managers_of_complaint()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, complaint_id, type, message)
  SELECT
    up.user_id,
    NEW.id,
    'complaint_filed',
    'New complaint filed by ' || NEW.guest_name || ' in room ' || NEW.room_number
  FROM public.user_profiles up
  WHERE up.role = 'manager';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_complaint_filed ON public.complaints;
CREATE TRIGGER on_complaint_filed
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_managers_of_complaint();

CREATE OR REPLACE FUNCTION notify_on_task_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, task_id, type, message)
    SELECT
      up.user_id,
      NEW.id,
      'task_assigned',
      'New task assigned to you: ' || NEW.title
    FROM public.user_profiles up
    WHERE up.id = NEW.assigned_to;
  END IF;

  INSERT INTO public.notifications (user_id, task_id, type, message)
  SELECT
    up.user_id,
    NEW.id,
    'task_created',
    'New task created: ' || NEW.title
  FROM public.user_profiles up
  WHERE up.role = 'manager' AND up.user_id != NEW.created_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_created ON public.tasks;
CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_task_created();
