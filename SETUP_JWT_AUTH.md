# 🔐 GearGuard with Supabase JWT Authentication

## ✅ What's New

I've completely rebuilt the authentication system with proper JWT tokens and role-based permissions:

### Authentication
- ✅ **Supabase Auth** with automatic JWT token management
- ✅ **Secure password hashing** (bcrypt via Supabase)
- ✅ **Session management** with automatic token refresh
- ✅ **Email confirmation** (optional, configurable in Supabase)

### Role-Based Permissions
- ✅ **3 Roles**: Admin, Manager, Technician
- ✅ **Only Admins & Managers** can create teams
- ✅ **Only Admins & Managers** can assign users to teams
- ✅ **Everyone** can create equipment and maintenance requests

### Team Management
- ✅ **Fixed team members view** - now shows all members properly
- ✅ **Assign existing users** to teams (users must signup first)
- ✅ **Automatic profile creation** when users signup

---

## 🚀 Setup Instructions

### Step 1: Run the New Database Migration

**IMPORTANT**: This will replace your current database schema.

1. **Go to Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/inlgwcewuzrtrrwdrcvx/sql/new
   ```

2. **Copy ALL the SQL** from `DATABASE_WITH_SUPABASE_AUTH.sql`

3. **Paste and Run** in Supabase

4. **You should see**:
   ```
   Teams created: 3
   Setup complete! Create users through signup page.
   ```

### Step 2: Disable Email Confirmation (For Testing)

By default, Supabase requires email confirmation. For testing, disable it:

1. Go to: https://supabase.com/dashboard/project/inlgwcewuzrtrrwdrcvx/auth/settings
2. Find **"Enable email confirmations"**
3. **Turn it OFF**
4. Click **Save**

### Step 3: Create Your First Admin User

1. **Start the app**: `npm run dev`
2. **Open**: http://localhost:5173
3. **Click**: "Sign up"
4. **Create account**:
   - Full Name: Admin User
   - Email: admin@company.com
   - Password: admin123 (or your choice)
5. **You'll be logged in automatically**

### Step 4: Make Yourself Admin

Since you're the first user, you need to manually set your role to admin:

1. **Go to Supabase**: https://supabase.com/dashboard/project/inlgwcewuzrtrrwdrcvx/editor
2. **Click**: "profiles" table
3. **Find your profile** (the one you just created)
4. **Click on the row** to edit
5. **Change `role` from "technician" to "admin"**
6. **Save**
7. **Refresh your app**

### Step 5: Test Everything

Now that you're an admin, you can:

✅ **Create Teams**:
- Go to Teams page
- Click "Add Team"
- Create "Mechanics", "IT Support", etc.

✅ **Create More Users**:
- Logout
- Signup with different emails
- Login as admin again

✅ **Assign Users to Teams**:
- Go to Teams page
- Click "Assign Team Member" button
- Select a user from dropdown (only users without teams shown)
- Select team and role
- Click "Assign to Team"

✅ **View Team Members**:
- Teams page now shows all members
- Member count updates automatically
- Shows member names, roles, and emails

---

## 🔑 How Authentication Works Now

### JWT Tokens
- Supabase automatically generates JWT tokens on login
- Tokens are stored in browser (httpOnly cookies + localStorage)
- Tokens auto-refresh before expiring
- All API requests include the JWT token in headers

### User Flow
1. **Signup** → Creates auth.users + profiles table entry
2. **Login** → Supabase validates and returns JWT token
3. **App** → Stores token and fetches profile
4. **Profile** → Contains role, team, etc.
5. **Logout** → Clears token and session

### Row Level Security (RLS)
The database enforces permissions:
- **Teams**: Anyone can view, only admins/managers can create/edit
- **Profiles**: Anyone can view, only admins/managers can assign to teams
- **Equipment**: Anyone can view, authenticated users can create/edit
- **Requests**: Anyone can view, authenticated users can create/edit

---

## 👥 Role-Based Features

### Technician (Default Role)
- ✅ View all pages
- ✅ Create equipment
- ✅ Create maintenance requests
- ✅ Update request status on Kanban
- ❌ Cannot create teams
- ❌ Cannot assign users to teams

### Manager
- ✅ Everything technicians can do
- ✅ Create teams
- ✅ Assign users to teams
- ✅ Change user roles

### Admin
- ✅ Everything managers can do
- ✅ Full system access
- ✅ Can promote users to admin/manager

---

## 🎯 Testing the System

### Test 1: Create Users
1. **Signup** 3 different users with different emails
2. **Login as admin**
3. **Go to Teams page**
4. **All 3 users** should appear in "Assign Team Member" dropdown

### Test 2: Assign to Teams
1. **Click "Assign Team Member"**
2. **Select a user**
3. **Select team** (Mechanics)
4. **Select role** (Technician)
5. **Click "Assign to Team"**
6. **Member appears** in team card immediately

### Test 3: Role Permissions
1. **Logout**
2. **Login as technician** (one of the users you created)
3. **Go to Teams page**
4. **"Add Team" and "Assign Team Member" buttons are HIDDEN**
5. **This is correct!** Only admins/managers see those buttons

### Test 4: View Team Members
1. **Login as admin**
2. **Go to Teams page**
3. **You should see**:
   - Team cards with member counts
   - List of members in each team
   - Member names, roles, and emails
   - Member badges showing role

---

## 🔧 Configuration

### Email Confirmation
To require email confirmation before login:
1. Go to Supabase Auth settings
2. Enable "Enable email confirmations"
3. Users must verify email before accessing app

### Password Requirements
Configure in Supabase Auth settings:
- Minimum password length (default: 6)
- Password strength requirements
- etc.

---

## 📊 Database Structure

### auth.users (Supabase managed)
```
- id: UUID (Supabase generates)
- email: TEXT
- encrypted_password: TEXT (bcrypt)
- created_at: TIMESTAMP
- ... (many other Supabase auth fields)
```

### profiles (Your app data)
```
- id: UUID (references auth.users.id)
- full_name: TEXT
- email: TEXT
- team_id: UUID (nullable, references teams)
- role: TEXT (admin, manager, technician)
- phone: TEXT (nullable)
```

### Automatic Profile Creation
When a user signs up:
1. Supabase creates entry in `auth.users`
2. Database trigger automatically creates entry in `profiles`
3. Default role is "technician"
4. Admins can later assign team and change role

---

## 🐛 Troubleshooting

### Can't login after signup
- **Check**: Email confirmation is disabled in Supabase Auth settings
- **Check**: User exists in auth.users table
- **Check**: Profile was auto-created in profiles table

### "Team members not showing"
- **Check**: Users have been assigned to teams
- **Check**: Console logs in Teams page (shows query results)
- **Check**: Profiles table has team_id set for those users

### "Can't create teams"
- **Check**: Your role is "admin" or "manager" in profiles table
- **Check**: You're logged in (not seeing login page)
- **Check**: Console for any errors

### "Assign Team Member button missing"
- **This is correct** if you're logged in as "technician"
- Only admins and managers see this button
- Check your role in profiles table

### Database RLS errors
- **Check**: RLS policies were created by the SQL migration
- **Check**: You're authenticated (have valid JWT token)
- **Check**: Supabase logs for specific RLS policy failures

---

## 🎨 UI Changes

### Navigation Bar
- Shows: Full name from profile (not email)
- Shows: Role badge (admin/manager/technician)
- Logout button works properly

### Teams Page
- "Add Team" button (admin/manager only)
- "Assign Team Member" button (admin/manager only)
- Team cards show member list
- Member count updates in real-time

### Login Page
- Removed demo account credentials
- Clean, simple login form
- Link to signup page

### Signup Page
- Creates user + profile automatically
- Default role: technician
- Auto-login after signup

---

## 🔐 Security Features

### Implemented
- ✅ JWT tokens with automatic refresh
- ✅ Secure password hashing (bcrypt via Supabase)
- ✅ Row Level Security (RLS) policies
- ✅ Role-based access control
- ✅ HTTPS-only API calls
- ✅ Token stored securely by Supabase client

### Best Practices
- Passwords never stored in plain text
- JWT tokens auto-expire and refresh
- Database enforces permissions (not just UI)
- Supabase handles all security best practices

---

## 📝 Summary

**What Changed:**
1. **Authentication**: Now using Supabase Auth with JWT tokens
2. **Profiles**: Linked to Supabase auth.users table
3. **Roles**: Admin, Manager, Technician with proper permissions
4. **Team Management**: Only admins/managers can manage
5. **Team View**: Fixed - now shows all members properly

**To Get Started:**
1. Run `DATABASE_WITH_SUPABASE_AUTH.sql` in Supabase
2. Disable email confirmation in Supabase Auth settings
3. Signup first user via app
4. Manually set first user role to "admin" in Supabase
5. Create teams and assign other users

**Everything works now with proper JWT authentication!** 🎉
