-- ================================
-- GEARGUARD WITH SUPABASE AUTHENTICATION (JWT)
-- This uses Supabase's built-in auth system with JWT tokens
-- ================================

-- Clean up existing tables
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ================================
-- CREATE TABLES
-- ================================

-- 1. Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles/Employees table (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'technician', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  warranty_end_date DATE NOT NULL,
  assigned_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  maintenance_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
  is_scrapped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Maintenance Requests table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('corrective', 'preventive')),
  scheduled_date DATE,
  duration_hours FLOAT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'repaired', 'scrap')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- CREATE INDEXES
-- ================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_equipment_assigned ON equipment(assigned_to_user_id);
CREATE INDEX idx_maintenance_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_maintenance_team ON maintenance_requests(team_id);
CREATE INDEX idx_maintenance_assigned ON maintenance_requests(assigned_to_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_scheduled ON maintenance_requests(scheduled_date);

-- ================================
-- ENABLE ROW LEVEL SECURITY
-- ================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- ================================
-- CREATE RLS POLICIES
-- ================================

-- Teams: Everyone can read, only admins and managers can create/update
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and managers can insert teams" ON teams;
CREATE POLICY "Admins and managers can insert teams" ON teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Admins and managers can update teams" ON teams;
CREATE POLICY "Admins and managers can update teams" ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Profiles: Everyone can read, only admins and managers can create, users can update their own
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and managers can insert profiles" ON profiles;
CREATE POLICY "Admins and managers can insert profiles" ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  ));

-- Equipment: Everyone can read, authenticated users can create/update
DROP POLICY IF EXISTS "Anyone can view equipment" ON equipment;
CREATE POLICY "Anyone can view equipment" ON equipment FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert equipment" ON equipment;
CREATE POLICY "Authenticated users can insert equipment" ON equipment FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update equipment" ON equipment;
CREATE POLICY "Authenticated users can update equipment" ON equipment FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Maintenance Requests: Everyone can read, authenticated users can create/update
DROP POLICY IF EXISTS "Anyone can view maintenance requests" ON maintenance_requests;
CREATE POLICY "Anyone can view maintenance requests" ON maintenance_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert maintenance requests" ON maintenance_requests;
CREATE POLICY "Authenticated users can insert maintenance requests" ON maintenance_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update maintenance requests" ON maintenance_requests;
CREATE POLICY "Authenticated users can update maintenance requests" ON maintenance_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ================================
-- CREATE TRIGGER FOR NEW USER SIGNUP
-- ================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'technician' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- INSERT SAMPLE DATA
-- ================================

-- Insert sample teams
INSERT INTO teams (id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Mechanics'),
  ('10000000-0000-0000-0000-000000000002', 'IT Support'),
  ('10000000-0000-0000-0000-000000000003', 'Electricians');

-- Note: Users must be created through Supabase Auth signup
-- You can create test users via the Supabase dashboard or signup page

-- Insert sample equipment (after creating users)
-- Run this separately after creating users through signup
-- INSERT INTO equipment (name, serial_number, category, department, location, purchase_date, warranty_end_date, maintenance_team_id) VALUES
--   ('CNC Machine 01', 'SN-12345', 'CNC Machine', 'Manufacturing', 'Workshop A', '2023-01-15', '2026-01-15', '10000000-0000-0000-0000-000000000001'),
--   ('Industrial Printer', 'SN-67890', 'Printer', 'Office', 'Floor 2', '2023-06-20', '2025-06-20', '10000000-0000-0000-0000-000000000002'),
--   ('Lathe Machine', 'SN-11111', 'Lathe', 'Manufacturing', 'Workshop B', '2022-03-10', '2025-03-10', '10000000-0000-0000-0000-000000000001');

-- ================================
-- VERIFICATION
-- ================================

SELECT 'Teams created: ' || COUNT(*)::TEXT FROM teams;
SELECT 'Setup complete! Create users through signup page.' AS status;
