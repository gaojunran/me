# Netlify Functions

This directory contains serverless functions that run on Netlify's edge network.

## 📁 Functions

### `wakatime.ts`

Proxies requests to the WakaTime API to avoid CORS issues and keep the API key secure.

**Endpoint**: `/.netlify/functions/wakatime`

**Query Parameters**:
- `endpoint` (required): The WakaTime API endpoint to call (e.g., `users/current/stats/last_7_days`)
- Any other parameters will be forwarded to the WakaTime API

**Example Usage**:

```javascript
// Fetch last 7 days stats
const response = await fetch('/.netlify/functions/wakatime?endpoint=users/current/stats/last_7_days')
const data = await response.json()

// Fetch summaries with date range
const response = await fetch('/.netlify/functions/wakatime?endpoint=users/current/summaries&start=2024-01-01&end=2024-01-31')
const data = await response.json()
```

**Environment Variables**:
- `WAKATIME_API_KEY`: Your WakaTime API key (required)

## 🔧 Local Development

To test functions locally, use Netlify CLI:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run the dev server with functions
netlify dev
```

This will start:
- Your Vite app on `http://localhost:3333`
- Netlify Functions on `http://localhost:8888/.netlify/functions/*`

## 🚀 Deployment

Functions are automatically deployed when you push to your repository (if connected to Netlify).

Make sure to set the `WAKATIME_API_KEY` environment variable in your Netlify site settings:

1. Go to **Site settings** → **Environment variables**
2. Add `WAKATIME_API_KEY` with your WakaTime API key

## 📚 Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [WakaTime API Documentation](https://wakatime.com/developers)
