# Pietro Mischi – AI twin & portfolio

Personal portfolio with an AI chatbot ("AI twin") that answers questions about my background in Italian, English and Swedish.

## Structure
- `api/chat.js` – serverless function (Vercel) that retrieves the most relevant CV sections and calls the Groq API. Unchanged.
- `cv-content.json` – CV knowledge base (one entry per topic, `text_it` / `text_en` / `text_sv`).
- `public/index.html` – page layout.
- `public/i18n.js` – all site copy in IT / EN / SV, plus project data.
- `public/app.js` – language switch, chat UI, timeline, projects.
- `public/curve.js` – interactive Nelson-Siegel volatility curve.
- `public/game.js` – Carry & Crash, a short-vol / long-vol / cash game.
- `public/frontline/index.html` – BTC Frontline, the live 3D Bitcoin order book. Works on its own at `/frontline/`; with `?embed=1&lang=en` it shows only the scene and sends its data to the page. The holographic Bitcoin history uses real monthly candles since July 2010: a baked-in archive, refreshed from Binance on every visit (CoinGecko daily closes on GitHub as a fallback), so it stays current without editing the file.
- `public/frontline-embed.js` – embeds BTC Frontline in the hero, shows price, pressure and walls in the site's style, and runs the short tutorial shown when the 3D view opens.
- `public/frontline-sound.js` – space-battle sound for the 3D view, synthesized live with the Web Audio API (no audio files). Off by default; the speaker button next to the views turns it on.
- `public/tape.js` – Beat the Tape, a 60-second news trading game.
- `public/extras.js` – arcade tabs, ticker tape, command palette (Ctrl/Cmd K), floating ask button.
- `public/i18n-extra.js` – copy for the parts above in IT / EN / SV.
- `public/styles.css` – styles (light and dark mode).

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```
Requires `GROQ_API_KEY` in `.env.local` (never committed).
