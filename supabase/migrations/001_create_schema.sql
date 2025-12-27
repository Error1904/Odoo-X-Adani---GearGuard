-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (team members)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'technician'))
);

-- Create equipment table
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
  maintenance_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  is_scrapped BOOLEAN DEFAULT FALSE
);

-- Create maintenance_requests table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assigned ON equipment(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON maintenance_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_team ON maintenance_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON maintenance_requests(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled ON maintenance_requests(scheduled_date);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can customize these based on your needs)
-- For now, allowing all authenticated users to read/write

-- Teams policies
CREATE POLICY "Allow all operations for authenticated users" ON teams
  FOR ALL USING (true) WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Allow all operations for authenticated users" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Equipment policies
CREATE POLICY "Allow all operations for authenticated users" ON equipment
  FOR ALL USING (true) WITH CHECK (true);

-- Maintenance requests policies
CREATE POLICY "Allow all operations for authenticated users" ON maintenance_requests
  FOR ALL USING (true) WITH CHECK (true);
