# The Teacher Vault — Safety & Quality Suite

A premium AI-powered safety and quality moment generator for professional training and toolbox talks.

## Setup

1. Connect this repo to [Netlify](https://app.netlify.com)
2. In Netlify → **Site configuration → Environment variables**, add:
   - `ANTHROPIC_API_KEY` — your key from [console.anthropic.com](https://console.anthropic.com)
3. Deploy

## Stack

- Vanilla HTML/CSS/JS frontend
- Netlify serverless function (`netlify/functions/generate.mjs`) as API proxy
- Claude Sonnet via Anthropic API with streaming
