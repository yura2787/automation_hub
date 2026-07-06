const { google } = require('googleapis');
const config = require('../../config');

const SHEET_NAME = 'Leads';

async function getLeadByRow(rowId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.google.credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = google.sheets({ version: 'v4', auth });

  const res = await client.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range: `${SHEET_NAME}!A${rowId}:G${rowId}`,
  });

  return res.data.values?.[0] || null;
}

async function statusHandler(ctx) {
  const rowId = ctx.session?.lastLeadId;

  if (!rowId) {
    await ctx.reply('No recent request found. Use /start to submit one.');
    return;
  }

  try {
    const row = await getLeadByRow(rowId);

    if (!row) {
      await ctx.reply('Could not find your request. Please try again.');
      return;
    }

    // row: [Date, Name, Phone, Company, Task, Status, UserID]
    const [date, name, , company, , status] = row;

    await ctx.reply(
      `📋 Request #${rowId}\n\n` +
      `👤 Name: ${name}\n` +
      `🏢 Company: ${company}\n` +
      `📅 Submitted: ${date}\n` +
      `🔖 Status: ${status}`,
    );
  } catch (err) {
    console.error('[statusHandler] failed to fetch lead:', err.message);
    await ctx.reply('Something went wrong. Please try again later.');
  }
}

module.exports = { statusHandler };
