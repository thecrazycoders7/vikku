# What is Vikku.in

**Vikku** is a software & technology company operating at `https://www.vikku.in`. It combines two things under one brand:

1. **A software & tech agency** — it designs and builds web apps, platforms, e-commerce stores, and custom digital products for clients (based in India, serving clients globally).
2. **A SaaS product — "Vikku PM"** — its own project-management application, plus a set of free AI-powered tools that double as lead generators for the agency.

---

## 1. The Agency

Vikku builds custom software for businesses: web applications, staffing/HR platforms, e-commerce stores, booking systems, marketing sites, and bespoke digital products. The site showcases real client work as case studies:

- **Staffing platform**
- **HSO — CCTV**
- **Rolex Ads**
- **Media Manager**

The agency funnel: a visitor uses a free tool or browses case studies → captured as a lead → booked into a free consultation → converted into a project.

---

## 2. Vikku PM (the SaaS product)

A full project-management app for teams and freelancers, accessed under `/pm`. Core capabilities:

- **Projects, tasks & Kanban board** with list view, labels, priorities, due dates, comments, bulk actions, and a Cmd+K quick-add
- **Custom workflows** — define your own stages/columns per project (Pro)
- **Milestones, timeline, calendar view, and project analytics**
- **AI Project Planner** — generates a realistic task + milestone plan from a project description (6/month free, unlimited on paid plans)
- **Time tracking** — timer, manual logging, billable hours, and exportable time reports (Pro)
- **Client share links** (PIN-protected) and **team collaboration** (member invites, shared access)
- **Project templates, PDF export, notifications, and a weekly digest email**

### Plans & pricing (pre-GST base)
| Plan | Monthly | Annual | Highlights |
|------|---------|--------|-----------|
| **Free** | ₹0 | — | 3 active projects, 6 AI plans/month, 3 members/project |
| **Pro** | ₹299 | ₹2,999 | Unlimited projects, custom workflows, time tracking, client links, 10 members/project |
| **Team** | ₹999 | ₹9,999 | Everything in Pro + unlimited team members |

Billing is **one-time payment** per period via Razorpay (UPI / card / netbanking), with 18% GST added at checkout. Plans expire at the period end and are renewed manually (auto-renew was removed because UPI-Autopay mandate QRs weren't reliably scannable).

---

## 3. Free AI Tools (lead magnets)

Four public, AI-powered tools under `/tools/*`, each producing a shareable report:

- **Cost Estimator** — itemised cost range for an app/website project, in the user's local currency
- **ROI Calculator** — how much revenue a business loses without a website and how fast one pays back
- **Timeline Calculator** — phase-by-phase project schedule
- **Tech Stack Recommender** — an opinionated frontend/backend/database/hosting recommendation

Each result can be **emailed as a PDF**, **shared via a public link** (`/r/:id`), downloaded, and flows into the next tool. Generating a result captures the user as a lead.

---

## 4. Admin Portal

An internal dashboard at `/admin` (restricted to admin emails) for running the business:

- **Overview** — MRR, ARR, total/active/paid users, projects, subscribers
- **Users, Billing, Analytics** (revenue & user-growth charts, forecast, churn)
- **Announcements** (broadcast to users), **bulk Email**, **Activity feed**, global search

Admin status is checked client-side for routing but **enforced server-side** on every data call.

---

## 5. Technical Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 8 single-page app, Tailwind CSS, lazy-loaded routes |
| **Hosting / CDN** | Vercel (with serverless functions under `/api`) |
| **Backend / DB / Auth** | Supabase (PostgreSQL with Row-Level Security, Auth, Edge Functions, Storage) |
| **Payments** | Razorpay (live) — one-time orders, signature + amount verified server-side |
| **AI** | OpenAI (`gpt-4o`) via Supabase Edge Functions, rate-limited per IP + global |
| **Email** | Resend |
| **Analytics** | Google Analytics (GA4) + Microsoft Clarity |

**Security posture:** RLS on all tables, server-enforced admin gating, payment signature verification, rate-limited public AI endpoints, hardened file-upload and CORS policies, and SEO/structured-data + accessibility baseline in place.

---

## 6. In One Sentence

> **Vikku is a software agency that builds custom digital products for clients, backed by its own project-management SaaS ("Vikku PM") and a suite of free AI tools that turn visitors into leads.**

---

*Document generated from the production codebase. Stack and features reflect the state as of June 2026.*
