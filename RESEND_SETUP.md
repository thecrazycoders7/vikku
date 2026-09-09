# 📧 Resend Email Integration - Setup Guide

## Overview

Team member invitations now send **real emails** using Resend. Beautiful, professional invitation emails are sent automatically when you invite someone to a project.

---

## ✅ Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs the `resend` package (already added to package.json).

### 2. Add API Key to .env

Add your Resend API key to `.env`:

```env
RESEND_API_KEY=YOUR_RESEND_API_KEY
```

### 3. Verify Domain (For Production)

For production emails from `noreply@vikku.in`:

1. Go to https://resend.com/domains
2. Add domain: `vikku.in`
3. Add DNS records to your domain provider
4. Wait for verification (usually 5-10 minutes)

**For testing**, you can use Resend's test mode which sends to your verified email only.

### 4. Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 📧 Email Features

### Beautiful HTML Email

The invitation email includes:
- ✅ Professional dark theme design
- ✅ Clear call-to-action button
- ✅ Step-by-step instructions
- ✅ Role information (Admin/Member/Viewer)
- ✅ Project name and inviter name
- ✅ Fallback plain text version
- ✅ Mobile-responsive design

### Email Content

**Subject:** `You've been invited to {Project Name}`

**Includes:**
- Who invited them
- Project name
- Their role and permissions
- Direct link to project
- Getting started instructions
- Text fallback for email clients

---

## 🔧 How It Works

### 1. User Invites Member
```javascript
// Click "Invite" button
// Enter email and role
// Click "Add Member"
```

### 2. Backend Sends Email
```javascript
// POST /api/send-invite
// Resend API sends email
// Returns success/failure
```

### 3. Member Receives Email
```
📧 Professional invitation email
👆 Click "View Project" button
🔐 Sign up with invited email
✅ Access granted automatically
```

---

## 📁 Files Created

### Backend API
- `@/Users/apple/vikku/api/send-invite.js` - Resend email endpoint

### Updated Files
- `@/Users/apple/vikku/src/components/pm/InviteMemberModal.jsx` - Sends email on invite
- `@/Users/apple/vikku/package.json` - Added resend dependency
- `@/Users/apple/vikku/.env.example` - Added RESEND_API_KEY

---

## 🎨 Email Template

The email uses a beautiful dark theme matching your brand:

```
┌─────────────────────────────────────┐
│  You've been invited to collaborate │
│                                     │
│  [Inviter] invited you to [Project] │
│  You have [Role] access             │
│                                     │
│      [  View Project Button  ]      │
│                                     │
│  📋 Getting Started:                │
│  1. Click button above              │
│  2. Sign up with this email         │
│  3. Start collaborating!            │
└─────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Email Sending

1. Go to http://localhost:5174/pm/projects/{id}
2. Click **"Invite"** button
3. Enter your own email address
4. Select a role
5. Click **"Add Member"**
6. Check your inbox!

### Verify Email Received

The email should:
- ✅ Arrive within seconds
- ✅ Have proper subject line
- ✅ Display correctly in Gmail/Outlook
- ✅ Button links to correct project
- ✅ Show project name and role

---

## 🔒 Security

### API Key Safety

- ✅ API key stored in `.env` (server-side only)
- ✅ Never exposed to frontend
- ✅ `.env` is gitignored
- ✅ Vercel automatically loads env vars

### Email Validation

- ✅ Email format validated before sending
- ✅ Duplicate invites prevented
- ✅ Only project owners can invite
- ✅ RLS policies enforce access control

---

## 🚀 Production Deployment

### Vercel Environment Variables

1. Go to Vercel project settings
2. Add environment variable:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `YOUR_RESEND_API_KEY`
3. Redeploy

### Domain Verification

For production emails from `noreply@vikku.in`:

1. Add domain in Resend dashboard
2. Add these DNS records:

```
Type: TXT
Name: @
Value: [Resend verification code]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

3. Wait for verification
4. Update email `from` address in `api/send-invite.js`

---

## 📊 Email Analytics

Resend provides:
- ✅ Delivery status
- ✅ Open rates
- ✅ Click rates
- ✅ Bounce tracking
- ✅ Spam reports

View in: https://resend.com/emails

---

## 🐛 Troubleshooting

### Email not sending

**Check:**
1. Is `RESEND_API_KEY` in `.env`?
2. Is dev server restarted?
3. Check browser console for errors
4. Check Resend dashboard for logs

### Email goes to spam

**Fix:**
1. Verify domain in Resend
2. Add SPF/DKIM records
3. Use verified sender domain
4. Avoid spam trigger words

### Wrong sender email

**Update** `api/send-invite.js`:
```javascript
from: 'Vikku PM <noreply@yourdomain.com>'
```

---

## 💡 Tips

### Custom Email Templates

Edit `api/send-invite.js` to customize:
- Email design
- Copy and messaging
- Colors and branding
- Additional information

### Rate Limits

Resend free tier:
- 100 emails/day
- 3,000 emails/month

For more, upgrade at: https://resend.com/pricing

---

## ✅ Summary

You now have **production-ready email invitations**:

✅ Beautiful HTML emails  
✅ Automatic sending on invite  
✅ Professional design  
✅ Mobile-responsive  
✅ Secure API integration  
✅ Ready for production  

Team members will receive professional invitation emails when you invite them! 🎉

---

**Questions?** Check Resend docs: https://resend.com/docs
