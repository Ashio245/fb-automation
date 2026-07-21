# ☕ Provi Beans — 60-Day Facebook Auto-Posting Bot

Automatically posts daily coffee & brand content from the **Provi Beans 60-Day Content Calendar** to your Facebook Page with high-quality photos from Pexels.

## Required GitHub Secrets & Environment Variables

Go to **Settings → Secrets and variables → Actions** in your repo and add:

| Variable / Secret | Required? | Description |
|---|---|---|
| `FB_PAGE_ID` | Yes | Your Facebook Page ID |
| `FB_PAGE_ACCESS_TOKEN` | Yes | Page access token with `pages_manage_posts` and `pages_read_engagement` permissions |
| `PEXELS_API_KEY` | Yes | Free API key from [pexels.com/api](https://www.pexels.com/api/) |
| `START_DATE` | Optional | Launch date in `YYYY-MM-DD` format (defaults to `2026-07-22`). Determines which day (1–60) runs automatically each calendar day. |
| `POST_DAY` | Optional | Override day number (1–60) to manually force a specific calendar post. |
| `DRY_RUN` | Optional | Set to `"true"` to preview output in console without making live Facebook posts. |

## Run Locally

```bash
export PEXELS_API_KEY="your-pexels-key"
export FB_PAGE_ID="your-page-id"
export FB_PAGE_ACCESS_TOKEN="your-token"

# Preview today's post (Dry Run)
DRY_RUN="true" node post.js

# Preview specific post (e.g. Day 5)
DRY_RUN="true" POST_DAY=5 node post.js

# Post live to Facebook
node post.js
```

## Trigger via External Cron / GitHub Actions

1. Workflow runs on `workflow_dispatch` trigger.
2. Setup a cron job on [cron-job.org](https://cron-job.org) targeting your GitHub workflow dispatch URL with a valid Personal Access Token (`Authorization: Bearer <PAT>`).
