# Deploying Supabase Edge Functions

The frontend deploys automatically to Vercel on merge to `main`. **Edge
functions do not** — they live in Supabase and are deployed manually through the
dashboard. This file is the checklist for that.

## How to deploy a function

1. Open the **Supabase dashboard → Edge Functions**.
2. Select the function (or **Create a new function** using the exact name of the
   folder under `supabase/functions/`).
3. Paste in the full contents of that function's `index.ts`.
4. Click **Deploy**.

> The Supabase CLI is not set up on this machine — the dashboard paste-and-deploy
> flow above is the source of truth. Migrations are applied the same way (SQL
> editor).

## Secrets (set once, in Edge Functions → Secrets)

| Secret | Notes |
| --- | --- |
| `OPENAI_API_KEY` | Custom secret — required by every `openai-*` function |
| `SUPABASE_URL` | Reserved default — present automatically |
| `SUPABASE_SERVICE_ROLE_KEY` | Reserved default — present automatically (used for rate limiting) |

## Functions

| Function | Purpose |
| --- | --- |
| `openai-estimate` | Legacy cost estimate (superseded by the client-side Project Estimator) |
| `openai-roi` | Legacy ROI (superseded by the client-side Business Impact model) |
| `openai-stack` | Legacy tech-stack (superseded by the client-side recommender) |
| `openai-timeline` | Legacy timeline (superseded by the client-side calculator) |
| `openai-maintenance` | Legacy maintenance (superseded by the client-side calculator) |
| `openai-plan` | AI project planner (Vikku PM) |
| `openai-visibility` | AI Visibility Score analysis |
| `smooth-handler` | AI executive summary for the Estimator & Business Impact tools (slug is `smooth-handler`; display name "openai-summary") |
| `admin-stats`, `get-client-file`, `send-notification`, `task-reminders`, `weekly-digest` | Non-AI app functions |

The client-side tools (Project Estimator, Business Impact, Tech Stack, Timeline,
Maintenance) run their calculations in the browser and need **no** edge function.
Only `openai-visibility` and `openai-summary` currently call OpenAI from the
frontend tools.

## ⚠️ Pending deploys

These have repo changes not yet pushed to Supabase:

- [x] **`openai-visibility`** — updated prompt/response for the richer report
  (6 dimensions, "what AI sees", tested queries, competitors, 30-day plan).
  Deployed & verified live. (PR #35)
- [x] **`smooth-handler`** — **new** function powering the "Generate AI executive
  summary" button on the Estimator & Business Impact results. Deployed (its
  Supabase slug is `smooth-handler`; the frontend calls that slug). (PR #37)

## Verifying a deploy

1. Open the live tool on https://www.vikku.in (must be the real origin — CORS
   only allows `vikku.in` / `www.vikku.in`, so it will not work from localhost).
2. Run it and confirm the new output appears.
3. If it errors, check the function's logs in the Supabase dashboard.
