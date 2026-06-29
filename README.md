# SEO Audit Dashboard

AI-powered SEO analysis tool built with React + Vite, using Claude as the SEO specialist engine.

---

## Setup (first time only)

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Rename `.env.local.example` to `.env.local` and paste your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get your key at: https://console.anthropic.com → API Keys

### 3. Run locally
```bash
npm install -g vercel   # only needed once
vercel dev
```
Open http://localhost:3000

> Use `vercel dev` instead of `npm run dev` so the /api/audit.js serverless function works locally.

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
vercel --prod
```

### Option B — GitHub + Vercel dashboard
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Click Deploy

---

## Project structure

```
seo-dashboard/
├── api/
│   └── audit.js          # Serverless function — proxies Anthropic API securely
├── src/
│   ├── main.jsx           # React entry point
│   └── App.jsx            # Full dashboard UI
├── public/
│   └── favicon.svg
├── .env.local.example     # Rename to .env.local and add your key
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## How it works

1. User enters a URL in the dashboard
2. React calls `/api/audit` (our Vercel serverless function)
3. The serverless function forwards the request to Anthropic with your API key (server-side, never exposed to browser)
4. Claude analyzes the URL as an SEO specialist and returns structured JSON
5. Dashboard renders the full audit report
