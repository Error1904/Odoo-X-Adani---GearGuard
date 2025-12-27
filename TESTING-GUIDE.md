# 🧪 GearGuard Testing Guide

Complete guide to test all features of GearGuard.

## Prerequisites

1. **Database is set up** (run the migration from QUICKSTART.md)
2. **App is running**: `npm run dev`
3. **Browser console open** (F12 or Cmd+Option+I)

## Method 1: Automated Test (Easiest)

### Use the Test Page

1. **Open the test page**:
   ```bash
   # Open in browser:
   open test-features.html
   # Or just drag test-features.html into your browser
   ```

2. **Click "Run All Tests"**

3. **Watch the log** - it will:
   - ✅ Create a test team
   - ✅ Create a test profile
   - ✅ Create test equipment
   - ✅ Create a maintenance request
   - Show success/error for each step

4. **Check the GearGuard app**:
   - Go to Teams page → See the test team
   - Go to Equipment page → See the test machine
   - Go to Kanban page → See the test request

---

## Method 2: Manual Testing (Step-by-Step)

### ✅ Step 1: Test Team Creation

**Goal**: Create a maintenance team

1. **Start the app**: `npm run dev`
2. **Open**: http://localhost:5173 (or the port shown in terminal)
3. **Go to**: Teams page (click "Teams" in nav)
4. **Click**: "Add Team" button (top right)
5. **Enter**: "Mechanics"
6. **Click**: "Create Team"

**Expected Result**:
- ✅ Dialog closes
- ✅ New card appears with "Mechanics"
- ✅ Shows "0 members"
- ✅ Console shows: "Team created successfully"

**Troubleshooting**:
- ❌ **Error appears**: Check console for exact error
- ❌ **Nothing happens**: Open console (F12), try again, look for errors
- ❌ **"relation does not exist"**: Database not set up, run migration

---

### ✅ Step 1.5: Test Adding Team Members

**Goal**: Add team members to your teams

1. **On Teams page**, click "Add Member" button (top right OR on any team card)
2. **Fill in the form**:
   - **Full Name**: John Smith
   - **Team**: Select "Mechanics" (or auto-selected if clicking from team card)
   - **Role**: Technician
3. **Click**: "Add Member"

**Expected Result**:
- ✅ Dialog closes
- ✅ Team card now shows "1 members"
- ✅ Member appears in the team card list
- ✅ Console shows: "Profile created successfully"

**Add More Members**:
4. Repeat to add more team members (Sarah Johnson, Mike Wilson, etc.)
5. Each team needs at least one member to create maintenance requests

---

### ✅ Step 2: Test Equipment Creation

**Goal**: Create equipment and assign to team

1. **Go to**: Equipment page
2. **Click**: "Add Equipment" button
3. **Fill in the form**:
   - **Name**: CNC Machine 01
   - **Serial Number**: SN-12345
   - **Category**: CNC Machine
   - **Department**: Manufacturing
   - **Location**: Workshop A
   - **Maintenance Team**: Select "Mechanics" (from dropdown)
   - **Purchase Date**: 2024-01-15
   - **Warranty End**: 2026-01-15
4. **Click**: "Create Equipment"

**Expected Result**:
- ✅ Dialog closes
- ✅ New equipment card appears
- ✅ Shows "CNC Machine 01"
- ✅ Console shows: "Equipment created"

**Test the Smart Button**:
5. **Click**: "View Details" on the equipment card
6. **Look for**: "Maintenance" button with badge
7. **Should show**: Badge is empty or shows "0" (no requests yet)

---

### ✅ Step 3: Test Maintenance Request (Corrective)

**Goal**: Create a breakdown/repair request with auto-fill

1. **Go to**: Equipment detail page (click on CNC Machine)
2. **Click**: "Create Maintenance Request" button
3. **Notice**:
   - Equipment is pre-selected ✅
   - **Wait for it**: Team should auto-fill after selecting equipment ✅
4. **Fill in**:
   - **Subject**: Oil leak detected
   - **Request Type**: Corrective (Breakdown)
   - **Priority**: High
   - **Equipment**: Should be pre-filled with "CNC Machine 01"
   - **Team**: Should auto-fill with "Mechanics"
5. **Click**: "Create Request"

**Expected Result**:
- ✅ Dialog closes
- ✅ Request appears on Kanban page
- ✅ Status is "New"
- ✅ Console shows: "Creating maintenance request"
- ✅ Console shows: "Team auto-filled from equipment settings"

**Verify Auto-fill Logic**:
6. **Go back** to Equipment detail
7. **Look at** the "Maintenance" button
8. **Should show**: Badge with "1" (one open request)

---

### ✅ Step 4: Test Kanban Board (Drag & Drop)

**Goal**: Move requests between status columns

1. **Go to**: Kanban page
2. **You should see**: 4 columns (New, In Progress, Repaired, Scrap)
3. **Find**: Your "Oil leak detected" request in the "New" column

**Test Drag & Drop**:
4. **Drag** the card from "New" → "In Progress"
5. **Expected**: Card moves smoothly
6. **Console should show**: Status update logs
7. **Drag** the card to "Repaired"
8. **Expected**: Card moves again

**Test Filtering**:
9. **Go to**: Equipment detail page
10. **Click**: "Maintenance" button (with the badge)
11. **Expected**: Kanban page opens filtered to that equipment
12. **URL should be**: `/maintenance/kanban?equipment=<id>`

---

### ✅ Step 5: Test Calendar & Scheduling

**Goal**: Schedule preventive maintenance on calendar

1. **Go to**: Calendar page
2. **Pick a future date** (e.g., 3 days from now)
3. **Click on that date**
4. **Right panel opens** showing the date
5. **Click**: "Schedule Maintenance" button
6. **Fill in the form**:
   - **Subject**: Routine inspection
   - **Request Type**: Preventive (Scheduled)
   - **Priority**: Normal
   - **Equipment**: CNC Machine 01
   - **Team**: Should auto-fill
   - **Scheduled Date**: Should be pre-filled with the date you clicked ✅
7. **Click**: "Create Request"

**Expected Result**:
- ✅ Dialog closes
- ✅ Small blue box appears on that calendar date
- ✅ Shows "Routine inspection"
- ✅ Click the date again → shows the request in the side panel

---

### ✅ Step 6: Test Scrap Logic

**Goal**: Verify equipment gets marked as scrapped

1. **Go to**: Kanban page
2. **Find** any maintenance request
3. **Drag it** to the "Scrap" column
4. **Go to**: Equipment page
5. **Find** that equipment
6. **Expected**: Should now show a red "Scrapped" badge

---

### ✅ Step 7: Test Overdue Indicators

**Goal**: See red borders for overdue requests

1. **Create a request** with scheduled date in the past:
   - Go to Kanban → "New Request"
   - Type: Preventive
   - Scheduled Date: Yesterday's date
   - Create it
2. **Go to**: Kanban page
3. **Expected**: Request has **red border** and red text for the date

---

## 🐛 Common Issues & Fixes

### Issue: "No profile found" error when creating request

**Cause**: No team members exist

**Fix**: Add team members using the "Add Member" button on the Teams page (Step 1.5)

### Issue: Team dropdown is empty in Equipment form

**Cause**: No teams exist

**Fix**: Create a team first (Step 1)

### Issue: Equipment dropdown is empty in Request form

**Cause**: No equipment exists

**Fix**: Create equipment first (Step 2)

### Issue: Team doesn't auto-fill when selecting equipment

**Cause**: Equipment doesn't have maintenance_team_id set

**Fix**:
1. Check console for "Auto-filled team" message
2. Make sure equipment has a team assigned
3. Try selecting different equipment

---

## 📊 Full Test Results Checklist

Use this to verify everything works:

- [ ] **Teams**
  - [ ] Create team ✓
  - [ ] Team appears in list ✓
  - [ ] Add team member ✓
  - [ ] Member appears in team card ✓
  - [ ] Member count updates ✓
  - [ ] Shows in equipment form dropdown ✓

- [ ] **Equipment**
  - [ ] Create equipment ✓
  - [ ] Equipment appears in list ✓
  - [ ] Detail page loads ✓
  - [ ] Smart button shows correct count ✓
  - [ ] Clicking smart button filters Kanban ✓
  - [ ] Shows in request form dropdown ✓

- [ ] **Maintenance Requests**
  - [ ] Create corrective request ✓
  - [ ] Create preventive request ✓
  - [ ] Team auto-fills when selecting equipment ✓
  - [ ] Request appears on Kanban ✓
  - [ ] Request appears on Calendar (preventive) ✓
  - [ ] Status defaults to "new" ✓

- [ ] **Kanban Board**
  - [ ] All 4 columns visible ✓
  - [ ] Cards show in correct columns ✓
  - [ ] Drag & drop works ✓
  - [ ] Status updates in database ✓
  - [ ] Shows technician avatar ✓
  - [ ] Shows priority badge ✓
  - [ ] Overdue indicator (red) appears ✓
  - [ ] Equipment filter works ✓

- [ ] **Calendar**
  - [ ] Month view loads ✓
  - [ ] Shows preventive requests on dates ✓
  - [ ] Clicking date shows side panel ✓
  - [ ] Can schedule from calendar ✓
  - [ ] Scheduled date pre-fills ✓
  - [ ] Navigation between months works ✓

- [ ] **Smart Features**
  - [ ] Auto-fill team logic ✓
  - [ ] Smart button badge count ✓
  - [ ] Scrap logic (equipment marked) ✓
  - [ ] Pre-fill equipment ID from detail page ✓
  - [ ] Pre-fill scheduled date from calendar ✓

---

## 🎯 Quick Smoke Test (2 minutes)

1. Create a team
2. Create equipment (assign to team)
3. Click equipment → Create request
4. Verify team auto-fills
5. Go to Kanban → drag card between columns
6. Check calendar → schedule a preventive request
7. ✅ If all 7 work → Everything is working!

---

## 📝 Report Issues

If something doesn't work, note:
1. Which step failed
2. Error message (from console)
3. What you expected vs what happened
4. Screenshot of console errors
