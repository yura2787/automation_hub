const { createBot, registerScenes } = require('./bot');

async function main() {
  const bot = createBot();

  // feat/lead-scene  — registerScenes(bot, [leadScene])
  // feat/bot-handlers — start and status commands

  bot.catch((err, ctx) => {
    console.error(`[bot] error for ${ctx.updateType}:`, err.message);
  });

  await bot.launch();
  console.log('[bot] started');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  console.error('[bot] fatal:', err.message);
  process.exit(1);
});
