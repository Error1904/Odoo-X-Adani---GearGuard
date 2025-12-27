-- ================================
-- COMPLETE DATABASE SETUP FOR GEARGUARD
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- ================================

-- Clean up existing tables (if any)
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
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

-- 2. Users table (for authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profiles/Employees table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'technician', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Equipment table
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

-- 5. Maintenance Requests table
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_team ON profiles(team_id);
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
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- ================================
-- CREATE RLS POLICIES (Allow all for now)
-- ================================

CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON equipment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);

-- ================================
-- CREATE HELPER FUNCTIONS
-- ================================

-- Function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(password || 'gearguard_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INSERT SAMPLE DATA
-- ================================

-- Insert sample teams
INSERT INTO teams (id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Mechanics'),
  ('10000000-0000-0000-0000-000000000002', 'IT Support'),
  ('10000000-0000-0000-0000-000000000003', 'Electricians');

-- Insert sample users (password for all: password123)
INSERT INTO users (id, email, password_hash, full_name) VALUES
  ('30000000-0000-0000-0000-000000000001', 'john.smith@company.com', hash_password('password123'), 'John Smith'),
  ('30000000-0000-0000-0000-000000000002', 'sarah.johnson@company.com', hash_password('password123'), 'Sarah Johnson'),
  ('30000000-0000-0000-0000-000000000003', 'mike.wilson@company.com', hash_password('password123'), 'Mike Wilson'),
  ('30000000-0000-0000-0000-000000000004', 'emily.davis@company.com', hash_password('password123'), 'Emily Davis'),
  ('30000000-0000-0000-0000-000000000005', 'admin@company.com', hash_password('admin123'), 'Admin User');

-- Insert sample profiles/employees
INSERT INTO profiles (id, user_id, full_name, email, team_id, role, phone) VALUES
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@company.com', '10000000-0000-0000-0000-000000000001', 'manager', '555-0101'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah.johnson@company.com', '10000000-0000-0000-0000-000000000001', 'technician', '555-0102'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Mike Wilson', 'mike.wilson@company.com', '10000000-0000-0000-0000-000000000002', 'manager', '555-0103'),
  ('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Emily Davis', 'emily.davis@company.com', '10000000-0000-0000-0000-000000000003', 'technician', '555-0104'),
  ('20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'Admin User', 'admin@company.com', NULL, 'admin', '555-0100');

-- Insert sample equipment
INSERT INTO equipment (name, serial_number, category, department, location, purchase_date, warranty_end_date, maintenance_team_id) VALUES
  ('CNC Machine 01', 'SN-12345', 'CNC Machine', 'Manufacturing', 'Workshop A', '2023-01-15', '2026-01-15', '10000000-0000-0000-0000-000000000001'),
  ('Industrial Printer', 'SN-67890', 'Printer', 'Office', 'Floor 2', '2023-06-20', '2025-06-20', '10000000-0000-0000-0000-000000000002'),
  ('Lathe Machine', 'SN-11111', 'Lathe', 'Manufacturing', 'Workshop B', '2022-03-10', '2025-03-10', '10000000-0000-0000-0000-000000000001'),
  ('Forklift 01', 'FK-2024', 'Forklift', 'Warehouse', 'Loading Bay', '2024-01-01', '2027-01-01', '10000000-0000-0000-0000-000000000001');

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Check if everything was created successfully
SELECT 'Teams created: ' || COUNT(*)::TEXT FROM teams;
SELECT 'Users created: ' || COUNT(*)::TEXT FROM users;
SELECT 'Profiles created: ' || COUNT(*)::TEXT FROM profiles;
SELECT 'Equipment created: ' || COUNT(*)::TEXT FROM equipment;

-- Show all employees with their teams
SELECT
  p.full_name,
  p.email,
  p.role,
  t.name AS team_name
FROM profiles p
LEFT JOIN teams t ON p.team_id = t.id
ORDER BY p.full_name;
