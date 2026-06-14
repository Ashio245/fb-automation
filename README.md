# ☕ Daily Coffee & Sustainability Facebook Post

Automatically posts one coffee-and-sustainability quote with a photo to your Facebook Page every day using GitHub Actions.

## Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** in your repo and add:

| Secret | Description |
|---|---|
| `FB_PAGE_ID` | Your Facebook Page ID |
| `FB_PAGE_ACCESS_TOKEN` | Page access token with `pages_manage_posts` and `pages_read_engagement` permissions |
| `PEXELS_API_KEY` | Free API key from [pexels.com/api](https://www.pexels.com/api/) |

## Run Locally (once)

```bash
export FB_PAGE_ID="your-page-id"
export FB_PAGE_ACCESS_TOKEN="your-token"
export PEXELS_API_KEY="your-pexels-key"
node post.js
```

## Trigger Manually in GitHub

1. Go to the **Actions** tab in your repo
2. Select **Daily Facebook Post**
3. Click **Run workflow**

## Daily Schedule

The workflow runs automatically every day at **08:00 UTC** via cron. GitHub Actions runs even when your laptop is off.
