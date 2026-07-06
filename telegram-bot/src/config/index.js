const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const required = ['BOT_TOKEN', 'MANAGER_CHAT_ID', 'SPREADSHEET_ID'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  manager: {
    chatId: process.env.MANAGER_CHAT_ID,
    email: process.env.MANAGER_EMAIL || '',
  },
  google: {
    spreadsheetId: process.env.SPREADSHEET_ID,
    credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  },
};
