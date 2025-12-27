-- ================================
-- ENHANCED DATABASE WITH AUTHENTICATION
-- Run this after the initial schema
-- ================================

-- Drop existing profiles table if it exists (we'll recreate with better structure)
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles/employees table (linked to users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'technician', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate equipment table
CREATE TABLE IF NOT EXISTS equipment (
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

-- Recreate maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_team ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned ON equipment(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON maintenance_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_team ON maintenance_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON maintenance_requests(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled ON maintenance_requests(scheduled_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - will be enhanced later)
DROP POLICY IF EXISTS "Allow all operations" ON users;
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON profiles;
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON equipment;
CREATE POLICY "Allow all operations" ON equipment FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON maintenance_requests;
CREATE POLICY "Allow all operations" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);

-- Function to hash passwords (simple version - use bcrypt in production)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a simple hash - in production use proper bcrypt
  RETURN encode(digest(password || 'salt_key_change_this', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert sample data with authentication
INSERT INTO users (id, email, password_hash, full_name) VALUES
  ('30000000-0000-0000-0000-000000000001', 'john.smith@company.com', hash_password('password123'), 'John Smith'),
  ('30000000-0000-0000-0000-000000000002', 'sarah.johnson@company.com', hash_password('password123'), 'Sarah Johnson'),
  ('30000000-0000-0000-0000-000000000003', 'mike.wilson@company.com', hash_password('password123'), 'Mike Wilson'),
  ('30000000-0000-0000-0000-000000000004', 'admin@company.com', hash_password('admin123'), 'Admin User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, user_id, full_name, email, team_id, role) VALUES
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@company.com', '10000000-0000-0000-0000-000000000001', 'manager'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Sarah Johnson', 'sarah.johnson@company.com', '10000000-0000-0000-0000-000000000001', 'technician'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Mike Wilson', 'mike.wilson@company.com', '10000000-0000-0000-0000-000000000002', 'manager'),
  ('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Admin User', 'admin@company.com', NULL, 'admin')
ON CONFLICT (id) DO NOTHING;

-- Sample teams (make sure they exist)
INSERT INTO teams (id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Mechanics'),
  ('10000000-0000-0000-0000-000000000002', 'IT Support'),
  ('10000000-0000-0000-0000-000000000003', 'Electricians')
ON CONFLICT (id) DO NOTHING;
