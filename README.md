# Automation Hub

A full-stack business automation system that handles client lead collection, data storage, document generation, and multi-channel manager notifications — all without manual work.

**Stack:** Node.js · Telegraf · Google Sheets API · Google Apps Script · Google Drive API · Docker

---

## What it does

A client opens Telegram and fills out a 4-step form. The bot validates each input in real time, saves the lead to Google Sheets, and instantly notifies the manager via Telegram. Google Apps Script picks up the new row, generates a branded PDF, saves it to Google Drive, and emails it to the manager — automatically.

```
Client → Telegram Bot → Google Sheets → Apps Script → PDF (Drive) → Email + Telegram
```

## Key features

- **Guided wizard** — 4-step conversational form with real-time input validation (name, phone format, company, task description)
- **Google Sheets as a database** — auto-creates headers on first run, appends new leads with status tracking
- **Automated PDF generation** — styled HTML-to-PDF conversion via Apps Script, stored in Google Drive
- **Dual notifications** — manager receives both a Telegram message and an email with the PDF attached
- **Status tracking** — clients can check their request status at any time with `/status`
- **Dockerized** — single `docker compose up -d` deployment, credentials mounted as a read-only volume

## Tech stack

| Layer | Technology |
|-------|-----------|
| Bot framework | [Telegraf](https://telegraf.js.org/) v4 (Node.js) |
| Google integration | googleapis v144 (service account auth) |
| Automation | Google Apps Script (onChange trigger) |
| PDF generation | Apps Script HTML-to-PDF via `Utilities.newBlob` |
| Email delivery | Apps Script `MailApp` |
| Deployment | Docker + Docker Compose |

## Project structure

```
automation-hub/
├── telegram-bot/
│   ├── src/
│   │   ├── bot/
│   │   │   ├── scenes/leadScene.js   # 4-step wizard (Telegraf WizardScene)
│   │   │   ├── handlers/start.js     # /start command
│   │   │   └── handlers/status.js    # /status command
│   │   ├── services/
│   │   │   ├── sheets.js             # Google Sheets read/write
│   │   │   ├── notifier.js           # Telegram manager notifications
│   │   │   └── validator.js          # input validation rules
│   │   ├── config/index.js           # env validation + export
│   │   └── index.js                  # entry point, service injection
│   ├── Dockerfile
│   └── package.json
├── google-apps-script/
│   ├── Code.gs                       # trigger entry point
│   ├── SheetHandler.gs               # scans for new leads
│   ├── PdfGenerator.gs               # HTML → PDF → Drive
│   └── Notifier.gs                   # email with PDF attachment
├── docker-compose.yml
├── .env.example
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- Docker (for production)
- Google Cloud project with Sheets API enabled
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Telegram bot token from @BotFather |
| `MANAGER_CHAT_ID` | Manager's Telegram chat ID |
| `MANAGER_EMAIL` | Manager's email (used by Apps Script) |
| `SPREADSHEET_ID` | Google Sheet ID from its URL |
| `GOOGLE_CREDENTIALS_PATH` | Path to service account JSON (default: `./credentials.json`) |

### 2. Google Sheets API

1. [Google Cloud Console](https://console.cloud.google.com/) → create a project → enable **Google Sheets API**
2. IAM → Service Accounts → Create → generate a JSON key → save as `credentials.json` in the project root
3. Share the Google Sheet with the service account email (Editor access)
4. The bot auto-creates the `Leads` sheet with column headers on first run

### 3. Google Apps Script

1. Open the Sheet → **Extensions → Apps Script**
2. Copy the 4 files from `google-apps-script/` into the editor
3. **Project Settings → Script properties** → add `MANAGER_EMAIL`
4. **Triggers → Add Trigger**: function `onSheetChange` · event type `On change`

### 4. Run locally

```bash
cd telegram-bot
npm install
npm start          # production
npm run dev        # development (nodemon)
```

### 5. Deploy with Docker

```bash
docker compose up -d        # build and start
docker compose logs -f bot  # stream logs
docker compose down         # stop
```

## Bot commands

| Command | Description |
|---------|-------------|
| `/start` | Launch the lead submission wizard |
| `/status` | Check the status of your last request |

## Google Sheet schema

| Date | Name | Phone | Company | Task | Status | UserID |
|------|------|-------|---------|------|--------|--------|

The manager updates **Status** manually: `New` → `In Progress` → `Done`.
Apps Script triggers on every sheet change and processes all rows with `Status = New`.
