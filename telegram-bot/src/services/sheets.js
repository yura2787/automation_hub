const { google } = require('googleapis');
const config = require('../config');

const SHEET_NAME = 'Leads';
const COLUMNS = ['Date', 'Name', 'Phone', 'Company', 'Task', 'Status', 'UserID'];

async function getClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.google.credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function ensureHeader(client) {
  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SHEET_NAME}!A1:G1`,
  });

  if (!res.data.values?.length) {
    await client.spreadsheets.values.update({
      spreadsheetId: config.google.spreadsheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [COLUMNS] },
    });
  }
}

async function saveLead(lead) {
  const client = await getClient();
  await ensureHeader(client);

  const row = [
    lead.date,
    lead.name,
    lead.phone,
    lead.company,
    lead.task,
    'New',
    String(lead.userId),
  ];

  const res = await client.spreadsheets.values.append({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  // Returns the row number of the inserted lead (1-based)
  const updatedRange = res.data.updates?.updatedRange || '';
  const match = updatedRange.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

module.exports = { saveLead };
