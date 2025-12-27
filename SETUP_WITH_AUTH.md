# 🚀 GearGuard Complete Setup with Authentication

## ✅ What's New

You now have a **complete employee management system with authentication**:
- 👥 **User/Employee Database** with email and passwords
- 🔐 **Login & Signup Pages**
- 👤 **User Profile Display** in navigation
- 🚪 **Logout functionality**
- 📧 **Email field** for all team members

---

## 🎯 Step 1: Run the Database Setup (REQUIRED)

### Go to Supabase SQL Editor

1. **Open**: https://supabase.com/dashboard/project/inlgwcewuzrtrrwdrcvx/sql
2. **Click**: "+ New query"
3. **Open** the file: `COMPLETE_DATABASE_SETUP.sql` in your project folder
4. **Copy ALL the SQL** from that file
5. **Paste** into Supabase SQL Editor
6. **Click**: "Run" or press Ctrl/Cmd + Enter
7. **Wait for**: "Success" message and verification output showing counts

### What This Does

Creates:
- ✅ **teams** table (for maintenance teams)
- ✅ **users** table (for authentication with email/password)
- ✅ **profiles** table (employee data linked to users)
- ✅ **equipment** table
- ✅ **maintenance_requests** table

Adds sample data:
- 3 teams (Mechanics, IT Support, Electricians)
- 5 users with passwords
- 5 employee profiles
- 4 pieces of equipment

---

## 🎯 Step 2: Start the Application

```bash
npm run dev
```

The app will start on http://localhost:5173 (or next available port)

---

## 🎯 Step 3: Test Authentication

### Login with Demo Accounts

The app will redirect you to the **Login page**.

**Demo accounts:**
- **Manager**: `john.smith@company.com` / `password123`
- **Technician**: `sarah.johnson@company.com` / `password123`
- **Admin**: `admin@company.com` / `admin123`

### Test Signup

1. Click **"Sign up"** link
2. Enter:
   - Full Name: Your Name
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
3. Click **"Create Account"**
4. You'll be automatically logged in

---

## 🎯 Step 4: Test Team Member Management

### View Team Members

1. Go to **Teams** page
2. You'll see:
   - 3 teams with member counts
   - Member names and roles displayed

### Add New Team Member

1. Click **"Add Member"** button (top right OR on team card)
2. Fill in:
   - **Full Name**: Jane Doe
   - **Email**: jane.doe@company.com
   - **Phone**: 555-0199 (optional)
   - **Team**: Select a team
   - **Role**: Technician/Manager/Admin
3. Click **"Add Member"**
4. ✅ Member appears immediately!

### Create New Team

1. Click **"Add Team"** button
2. Enter team name
3. Click **"Create Team"**
4. ✅ Team appears with 0 members

---

## 🎯 Step 5: Test All Features

### 1. Equipment Management

1. Go to **Equipment** page
2. Click **"Add Equipment"**
3. Fill in the form (assign to a team)
4. ✅ Equipment appears with team assigned

### 2. Create Maintenance Request

1. Click on any equipment
2. Click **"Create Maintenance Request"**
3. Notice:
   - Equipment is pre-selected
   - Team auto-fills based on equipment
4. Fill in subject, priority, type
5. ✅ Request created and appears on Kanban

### 3. Kanban Board

1. Go to **Kanban** page
2. ✅ See all requests in columns
3. **Drag cards** between columns
4. ✅ Status updates automatically

### 4. Calendar

1. Go to **Calendar** page
2. Click on a date
3. Click **"Schedule Maintenance"**
4. Create a preventive maintenance request
5. ✅ Appears on calendar

### 5. Logout

1. Click **"Logout"** button in navigation
2. ✅ Redirects to login page

---

## 📊 What's Working Now

### Authentication ✅
- [x] Login page with validation
- [x] Signup page with password confirmation
- [x] User info display in navigation
- [x] Logout functionality
- [x] Session persistence (localStorage)

### Team Members ✅
- [x] Add team members with email and phone
- [x] View all team members
- [x] Member count per team
- [x] Role assignment (Manager, Technician, Admin)
- [x] Link team members to authentication users

### All Previous Features ✅
- [x] Teams management
- [x] Equipment tracking
- [x] Maintenance requests (Corrective & Preventive)
- [x] Kanban board with drag-and-drop
- [x] Calendar scheduling
- [x] Auto-fill team from equipment
- [x] Smart badge showing open request count
- [x] Scrap equipment on status change

---

## 🔑 Database Structure

### Users Table (Authentication)
```
- id: UUID (primary key)
- email: TEXT (unique)
- password_hash: TEXT (SHA-256 hashed)
- full_name: TEXT
- is_active: BOOLEAN
```

### Profiles Table (Employees)
```
- id: UUID (primary key)
- user_id: UUID (links to users table)
- full_name: TEXT
- email: TEXT (unique)
- team_id: UUID (links to teams)
- role: TEXT (manager, technician, admin)
- phone: TEXT (optional)
```

### How They Connect
- **Signup** creates both a `user` record (for auth) and a `profile` record (for employee data)
- **Login** checks `users` table and retrieves `profile` data
- **Team Members** are stored in `profiles` table

---

## 🐛 Troubleshooting

### "Invalid email or password"
- Check that you ran the database setup SQL
- Try one of the demo accounts listed above
- Password is case-sensitive

### "No teams found"
- Database setup SQL not run yet
- Go to Supabase Table Editor → teams to verify data exists

### "Cannot add team member"
- Make sure at least one team exists
- Check console (F12) for specific error
- Verify email is unique (not already used)

### Profile Creation Fails
- Email must be unique across all profiles
- Team must exist before assigning member to it
- Check Supabase Table Editor to verify data

### Can't see team members on Teams page
- Refresh the page after adding members
- Check console for errors
- Verify profiles table has data in Supabase

---

## 🎨 UI Features

### Navigation Bar
- Shows current user's name and role
- Logout button
- Login button when not authenticated
- All navigation links (Equipment, Kanban, Calendar, Teams)

### Login Page
- Email and password fields
- "Remember me" via localStorage
- Link to signup
- Demo account credentials displayed

### Signup Page
- Full name, email, password fields
- Password confirmation
- Automatic login after signup
- Link back to login

### Teams Page
- Team cards showing member count
- List of team members with roles
- "Add Member" button on each card
- "Add Member" and "Add Team" buttons at top

---

## 🔐 Security Notes

### Current Implementation
- Passwords are hashed using SHA-256
- Passwords are stored hashed in database
- Never stored in plain text

### For Production
- Use proper bcrypt library for password hashing
- Implement proper session management
- Add CSRF protection
- Set up proper RLS policies in Supabase
- Add rate limiting on login attempts

---

## 🚀 Next Steps

Optional enhancements:
1. Add "Forgot Password" functionality
2. Add email verification
3. Add role-based permissions (admins can see more)
4. Add user profile edit page
5. Add team member removal
6. Add password change functionality

---

## 📝 Summary

**You now have:**
- ✅ Complete database with users and profiles
- ✅ Login and signup pages working
- ✅ Team member management with email
- ✅ All original features (equipment, maintenance, kanban, calendar)
- ✅ User session management
- ✅ Sample data to test with

**To get started:**
1. Run `COMPLETE_DATABASE_SETUP.sql` in Supabase
2. Run `npm run dev`
3. Login with `john.smith@company.com` / `password123`
4. Explore all features!

---

## ❓ Questions?

If something doesn't work:
1. Check that database SQL was run successfully
2. Check browser console (F12) for errors
3. Verify Supabase connection in `.env` file
4. Try the demo accounts first before creating new ones
