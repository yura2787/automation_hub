const config = require('../config');

function formatDate(iso) {
  return new Date(iso).toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
}

async function notifyManager(bot, lead, rowId) {
  const text = [
    `🔔 NEW LEAD #${rowId ?? '—'}`,
    '',
    `👤 Name: ${lead.name}`,
    `📞 Phone: ${lead.phone}`,
    `🏢 Company: ${lead.company}`,
    `💬 Task: ${lead.task}`,
    `🕐 Time: ${formatDate(lead.date)}`,
  ].join('\n');

  await bot.telegram.sendMessage(config.manager.chatId, text);
}

module.exports = { notifyManager };
