# GearGuard Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be set up (takes about 2 minutes)

#### Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

#### Update Environment Variables
1. Open the `.env` file in the project root
2. Replace the placeholder values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up the Database

#### Option A: Using Supabase SQL Editor (Recommended for beginners)
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_create_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. You should see "Success. No rows returned"

#### Option B: Using Supabase CLI (For developers)
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### 4. Verify Database Setup
1. In Supabase dashboard, go to **Table Editor**
2. You should see 4 tables:
   - `teams`
   - `profiles`
   - `equipment`
   - `maintenance_requests`

### 5. Add Sample Data (Optional)

To test the application, you can add some sample data through the Supabase SQL Editor:

```sql
-- Insert a sample team
INSERT INTO teams (name) VALUES ('Mechanics');

-- Insert a sample team member (get the team id from the teams table first)
INSERT INTO profiles (full_name, team_id, role)
VALUES ('John Doe', 'your-team-id-here', 'manager');

-- Insert sample equipment (use the team and profile ids from above)
INSERT INTO equipment (
  name,
  serial_number,
  category,
  department,
  location,
  purchase_date,
  warranty_end_date,
  maintenance_team_id
) VALUES (
  'CNC Machine 01',
  'SN-12345',
  'CNC Machine',
  'Manufacturing',
  'Workshop A',
  '2023-01-15',
  '2026-01-15',
  'your-team-id-here'
);
```

### 6. Start the Development Server
```bash
npm run dev
```

The application will open at [http://localhost:5173](http://localhost:5173)

## Troubleshooting

### Build Errors
If you encounter build errors:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
1. Verify your `.env` file has the correct credentials
2. Check that your Supabase project is active
3. Ensure the database migration was run successfully

### Missing Tables
If tables are missing:
1. Run the SQL migration again in the Supabase SQL Editor
2. Refresh the Table Editor page

## Next Steps

Once the application is running:

1. **Create Teams**: Go to Teams page and create your maintenance teams
2. **Add Team Members**: Add profiles for your technicians and managers
3. **Register Equipment**: Add your company assets with details
4. **Create Requests**: Start creating maintenance requests

## Features to Explore

- **Kanban Board**: Drag and drop maintenance requests between status columns
- **Calendar View**: Schedule and view preventive maintenance
- **Equipment Detail**: Click on equipment to see the smart "Maintenance" button with request count
- **Filtering**: Use the equipment filter on the Kanban board (click from Equipment detail page)

## Production Deployment

Before deploying to production:

1. **Update RLS Policies**: Customize Row Level Security policies in Supabase for your security requirements
2. **Authentication**: Add Supabase Auth to manage user access
3. **Environment Variables**: Use production Supabase credentials
4. **Build Optimization**: Consider code splitting for better performance

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Support

For issues:
1. Check the [README.md](./README.md) for detailed documentation
2. Review the database schema in `supabase/migrations/001_create_schema.sql`
3. Check Supabase logs in your dashboard under **Logs** > **Database**
