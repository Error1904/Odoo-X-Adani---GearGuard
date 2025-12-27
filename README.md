# GearGuard - Maintenance Management System

A comprehensive maintenance management system built with React, TypeScript, Tailwind CSS, and Supabase for tracking company assets and managing maintenance requests.

## Features

### 🏢 Equipment Management
- **CRUD Operations**: Create, read, update, and delete equipment
- **Smart Button**: Equipment detail pages show a button with a badge displaying the count of open maintenance requests
- **Asset Tracking**: Track serial numbers, categories, departments, locations, purchase dates, and warranties
- **Scrap Management**: Automatically mark equipment as scrapped when maintenance status changes to 'scrap'

### 🔧 Maintenance Request Workflows

#### Corrective Maintenance (The Breakdown)
1. User creates a new maintenance request
2. System automatically fills the team based on the equipment's assigned maintenance team
3. Initial status is set to 'new'
4. Manager/Technician assigns themselves
5. Status changes to 'in_progress' during work
6. User enters duration and changes status to 'repaired' when complete
7. If status is 'scrap', the equipment is automatically marked as scrapped

#### Preventive Maintenance (The Routine Checkup)
1. User creates a request with type 'preventive'
2. User must select a scheduled date
3. Request appears on the Calendar view

### 📊 Kanban Board
- **Drag & Drop**: Move requests between columns (New, In Progress, Repaired, Scrap)
- **Visual Indicators**:
  - Technician avatars
  - Overdue indicators (red border/text) for scheduled dates that have passed
  - Priority badges
- **Equipment Information**: Each card shows the equipment name and subject

### 📅 Calendar View
- Monthly calendar displaying preventive maintenance requests
- Click dates to view scheduled maintenance
- Color-coded status indicators
- Schedule new preventive maintenance from any date

### 👥 Team Management
- Create and manage maintenance teams
- Assign team members with roles (manager/technician)
- View team members and their roles

## Tech Stack

- **Frontend**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Setup Instructions

### 1. Clone and Install

```bash
cd gearguard
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Update the `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Schema

Run the SQL migration file in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/migrations/001_create_schema.sql
# and run it in the Supabase SQL Editor
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Tables

#### `teams`
- Maintenance teams (e.g., "Mechanics", "IT Support")
- Fields: id, name, created_at

#### `profiles`
- Team members who handle maintenance
- Fields: id, full_name, team_id, role (manager/technician)

#### `equipment`
- Company assets to be maintained
- Fields: id, name, serial_number, category, department, location, purchase_date, warranty_end_date, assigned_to_user_id, maintenance_team_id, is_scrapped

#### `maintenance_requests`
- Work orders for equipment maintenance
- Fields: id, subject, equipment_id, team_id, assigned_to_id, request_type (corrective/preventive), scheduled_date, duration_hours, status (new/in_progress/repaired/scrap), priority (low/normal/high), created_by, created_at

## Key Features Implementation

### Auto-fill Team Logic
When creating a maintenance request and selecting an equipment, the system automatically fetches the `maintenance_team_id` from the equipment record and assigns it to the request's team.

### Smart Button with Badge
Equipment detail pages include a "Maintenance" button that:
- Shows a badge with the count of open requests (status: 'new' or 'in_progress')
- Clicking navigates to the Kanban board filtered by that equipment

### Scrap Logic
When a maintenance request status changes to 'scrap', the system automatically updates the linked equipment record to set `is_scrapped = true`.

### Overdue Indicators
On the Kanban board, requests with a `scheduled_date` in the past and status not 'repaired' are highlighted with red borders and text.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── database.types.ts   # TypeScript types for database
│   └── utils.ts            # Utility functions
├── pages/
│   ├── HomePage.tsx
│   ├── EquipmentPage.tsx
│   ├── EquipmentDetailPage.tsx
│   ├── MaintenanceKanbanPage.tsx
│   ├── MaintenanceCalendarPage.tsx
│   └── TeamsPage.tsx
└── App.tsx                  # Main app with routing

supabase/
└── migrations/
    └── 001_create_schema.sql
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages**: Add to `src/pages/` and update routes in `App.tsx`
2. **New Components**: Add to `src/components/`
3. **Database Changes**: Create new migration files in `supabase/migrations/`
4. **UI Components**: Use Shadcn UI components from `src/components/ui/`

## Security

- Row Level Security (RLS) is enabled on all tables
- Current policies allow all authenticated users to perform all operations
- **Production**: Update RLS policies to match your security requirements

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Deployed on Vercel

https://gearguard-eosin.vercel.app/

For deployment steps, see [DEPLOYMENT.md](DEPLOYMENT.md).