# 🤝 Team Collaboration Features - Vikku PM

## Overview

Vikku PM is a **full-featured collaboration platform** where teams can work together on projects in real-time. Multiple users can view, edit, and manage projects simultaneously.

---

## ✨ Features

### 1. **Team Member Invitations**
- Invite unlimited team members to any project
- Assign roles: Admin, Member, or Viewer
- Email-based invitations
- No signup required for invited members

### 2. **Role-Based Access Control**

| Role | View Project | Edit Tasks | Delete Tasks | Manage Milestones | Invite Members | Delete Project |
|------|--------------|------------|--------------|-------------------|----------------|----------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Member** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3. **Client Share Links** (Pro Feature)
- Generate read-only share links
- Clients can view progress without signing up
- No editing permissions
- Perfect for client updates

### 4. **Real-Time Collaboration**
- Multiple users can work on the same project
- Changes are reflected instantly
- Powered by Supabase real-time subscriptions

---

## 🚀 How to Use

### Inviting Team Members

1. **Open a Project**
   - Go to `/pm/projects/{project_id}`

2. **Click "Invite" Button**
   - Located in the top-right header

3. **Enter Details**
   - Email address of team member
   - Select role (Admin/Member/Viewer)
   - Click "Send Invitation"

4. **Team Member Joins**
   - They receive an email invitation
   - Click the link to join the project
   - Start collaborating immediately

### Managing Team Members

1. **View Team**
   - Members panel shows all collaborators
   - See roles and permissions

2. **Remove Members** (Owner/Admin only)
   - Hover over member name
   - Click the X icon
   - Confirm removal

### Sharing with Clients

1. **Enable Pro** (if not already)
   - Click "Share" button
   - Upgrade to Pro if prompted

2. **Copy Share Link**
   - Click "Copy link" button
   - Send to client via email/Slack/etc.

3. **Client Views Project**
   - No login required
   - Read-only access
   - See tasks, milestones, progress

---

## 🔧 Setup Instructions

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
cat enable-team-collaboration.sql
```

This updates RLS policies to support team members.

### 2. Verify Tables

Ensure these tables exist:
- ✅ `pm_projects`
- ✅ `pm_tasks`
- ✅ `pm_milestones`
- ✅ `pm_project_members`

### 3. Test Collaboration

1. Create a project
2. Invite a team member
3. Have them join and edit tasks
4. Verify changes appear in real-time

---

## 🔒 Security

### Row Level Security (RLS)

All database access is controlled by RLS policies:

**Projects:**
- Users can view projects they own OR are members of
- Only owners can delete projects

**Tasks:**
- Team members can view tasks in their projects
- Admins and Members can create/edit tasks
- Only Admins can delete tasks

**Milestones:**
- Team members can view milestones
- Admins and Members can manage milestones

**Members:**
- Only project owners can invite/remove members
- Members can view other team members

### Data Privacy

- ✅ Users can only see projects they have access to
- ✅ Email addresses are private
- ✅ Share tokens are randomly generated
- ✅ No data leakage between projects

---

## 📊 Database Schema

### `pm_project_members` Table

```sql
CREATE TABLE pm_project_members (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES pm_projects(id),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Roles Explained

- **Owner**: Project creator, full control
- **Admin**: Can manage everything except deleting project
- **Member**: Can edit tasks and milestones
- **Viewer**: Read-only access

---

## 🎯 Use Cases

### 1. **Agency + Client Collaboration**
- Agency creates project
- Invites client as Viewer
- Client tracks progress in real-time
- No back-and-forth emails

### 2. **Development Team**
- Project manager creates project
- Invites developers as Members
- Everyone updates their tasks
- PM tracks overall progress

### 3. **Freelancer + Contractor**
- Freelancer creates project
- Invites contractor as Admin
- Both manage tasks together
- Share link with end client

---

## 🔄 Real-Time Updates

### Supabase Subscriptions

The app uses Supabase real-time subscriptions to sync changes:

```javascript
// Subscribe to task changes
supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'pm_tasks' },
    (payload) => {
      // Update UI with new data
    }
  )
  .subscribe()
```

### What's Synced in Real-Time

- ✅ Task status changes
- ✅ New tasks created
- ✅ Tasks deleted
- ✅ Milestone updates
- ✅ Project status changes

---

## 🐛 Troubleshooting

### "Permission denied" errors

**Cause**: RLS policies not updated  
**Fix**: Run `enable-team-collaboration.sql`

### Invited members can't see project

**Cause**: User ID mismatch  
**Fix**: Ensure invited user signs up with the same email

### Changes not appearing in real-time

**Cause**: Supabase subscriptions not set up  
**Fix**: Check browser console for errors

### Can't invite members

**Cause**: Not project owner  
**Fix**: Only owners can invite members

---

## 📈 Future Enhancements

Planned features:
- [ ] Activity feed (who changed what)
- [ ] @mentions in task comments
- [ ] Email notifications for task assignments
- [ ] Slack integration
- [ ] Mobile app
- [ ] Offline mode with sync

---

## 🎉 Summary

Vikku PM is now a **production-ready collaboration platform**:

✅ Multi-user support  
✅ Role-based permissions  
✅ Real-time updates  
✅ Client share links  
✅ Secure data access  
✅ Professional UI  

Perfect for agencies, teams, and freelancers managing client projects!

---

**Questions?** Check the main README or open an issue.
