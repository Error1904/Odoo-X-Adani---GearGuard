# Quick Start - Get GearGuard Running in 5 Minutes

## Step 1: Database Setup (2 minutes)

Your `.env` file is already configured with Supabase credentials!

### Run the Migration

1. Go to your Supabase project: https://supabase.com/dashboard/project/inlgwcewuzrtrrwdrcvx
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste this SQL:

```sql
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

-- Create basic RLS policies (allowing all operations for now)
DROP POLICY IF EXISTS "Allow all operations" ON teams;
CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON profiles;
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON equipment;
CREATE POLICY "Allow all operations" ON equipment FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON maintenance_requests;
CREATE POLICY "Allow all operations" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);
```

5. Click **Run** or press `Ctrl/Cmd + Enter`
6. You should see "Success. No rows returned"

### Add Sample Data (Optional but Recommended)

Run this SQL to add demo data:

```sql
-- Insert sample teams
INSERT INTO teams (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mechanics'),
  ('00000000-0000-0000-0000-000000000002', 'IT Support')
ON CONFLICT DO NOTHING;

-- Insert sample team members
INSERT INTO profiles (id, full_name, team_id, role) VALUES
  ('00000000-0000-0000-0000-000000000011', 'John Smith', '00000000-0000-0000-0000-000000000001', 'manager'),
  ('00000000-0000-0000-0000-000000000012', 'Sarah Johnson', '00000000-0000-0000-0000-000000000001', 'technician'),
  ('00000000-0000-0000-0000-000000000013', 'Mike Wilson', '00000000-0000-0000-0000-000000000002', 'manager')
ON CONFLICT DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (name, serial_number, category, department, location, purchase_date, warranty_end_date, maintenance_team_id) VALUES
  ('CNC Machine 01', 'SN-12345', 'CNC Machine', 'Manufacturing', 'Workshop A', '2023-01-15', '2026-01-15', '00000000-0000-0000-0000-000000000001'),
  ('Industrial Printer', 'SN-67890', 'Printer', 'Office', 'Floor 2', '2023-06-20', '2025-06-20', '00000000-0000-0000-0000-000000000002'),
  ('Lathe Machine', 'SN-11111', 'Lathe', 'Manufacturing', 'Workshop B', '2022-03-10', '2025-03-10', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
```

## Step 2: Start the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:5173

## Step 3: Test Features (2 minutes)

### Create a Team
1. Go to **Teams** page
2. Click **Add Team**
3. Enter "Electricians" and save

### Add Equipment
1. Go to **Equipment** page
2. Click **Add Equipment**
3. Fill in the form:
   - Name: "Generator 01"
   - Serial: "GEN-001"
   - Category: "Generator"
   - Department: "Facilities"
   - Location: "Basement"
   - Select a Maintenance Team
   - Pick dates
4. Click **Create Equipment**

### Create Maintenance Request
1. Go to **Equipment** page
2. Click on any equipment
3. Click **Create Maintenance Request**
4. Fill in:
   - Subject: "Oil Change"
   - Type: Preventive
   - Priority: Normal
   - Select Equipment (should be pre-filled!)
   - Team (should auto-fill!)
   - Pick a scheduled date
5. Click **Create Request**

### Use the Kanban Board
1. Go to **Kanban** page
2. Drag the card between columns!
3. Watch it move from New → In Progress → Repaired

### Use the Calendar
1. Go to **Calendar** page
2. Click on a date
3. Click **Schedule Maintenance**
4. Create a preventive maintenance request

## Troubleshooting

### "No profile found" Error
This means you need to create at least one team member first:
1. Create a Team
2. Then manually add a profile in Supabase:
   - Go to **Table Editor** > **profiles**
   - Insert a row with full_name, team_id, and role

### Pages Loading Slowly
This is normal on first load as Supabase fetches data. Subsequent loads will be faster due to React Query caching.

### Can't See Data
1. Check the Supabase **Table Editor** to verify data exists
2. Check browser console (F12) for errors
3. Verify your `.env` credentials are correct

## What's Working

✅ Create Teams
✅ Add Equipment
✅ Create Maintenance Requests (Corrective & Preventive)
✅ Drag-and-drop Kanban board
✅ Calendar scheduling
✅ Auto-fill team when selecting equipment
✅ Smart button showing open request count
✅ Scrap equipment automatically when request status = 'scrap'
✅ Overdue indicators on Kanban

## Next Steps

- Add team members (profiles) through forms (coming soon)
- Add authentication
- Customize the design
- Add more filtering options
