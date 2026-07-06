# Automation Hub

Система автоматизації бізнес-процесів: клієнт залишає заявку через Telegram-бота,
вона зберігається в Google Sheets, а Google Apps Script генерує PDF і сповіщає
менеджера (email + Telegram).

## Як це працює

```
Клієнт пише боту
        ↓
Telegram Bot (Node.js + Telegraf)
        ↓
Google Sheets (зберігає заявку)
        ↓
Google Apps Script (тригер на новий рядок)
        ↓
Генерує PDF документ
        ↓
Email менеджеру з PDF  +  Telegram-сповіщення менеджеру
```

## Структура проєкту

```
automation-hub/
├── telegram-bot/          # Node.js + Telegraf бот
│   ├── src/
│   │   ├── bot/           # сцени та хендлери
│   │   ├── services/      # sheets, notifier, validator
│   │   └── config/        # конфіг з env
│   ├── Dockerfile
│   └── package.json
├── google-apps-script/    # Code.gs, SheetHandler.gs, PdfGenerator.gs, Notifier.gs
├── docker-compose.yml
├── .env.example
└── README.md
```

## Швидкий старт (локально)

> ⚙️ Детальні інструкції додаються в наступних гілках.

1. Скопіюй змінні середовища:
   ```bash
   cp .env.example .env
   ```
2. Заповни `.env` та поклади `credentials.json` у корінь проєкту.
3. Запусти бота:
   ```bash
   cd telegram-bot && npm install && npm start
   ```

## Розділи документації (TODO)

- [ ] Опис проєкту
- [ ] Як запустити локально
- [ ] Як налаштувати Google Sheets API
- [ ] Як налаштувати Google Apps Script
- [ ] Як задеплоїти через Docker

## Змінні середовища

Див. [`.env.example`](.env.example).

| Змінна | Опис |
|--------|------|
| `BOT_TOKEN` | Токен Telegram-бота від @BotFather |
| `MANAGER_CHAT_ID` | Chat ID менеджера для сповіщень |
| `MANAGER_EMAIL` | Email менеджера для PDF |
| `SPREADSHEET_ID` | ID Google-таблиці |
| `GOOGLE_CREDENTIALS_PATH` | Шлях до `credentials.json` |
