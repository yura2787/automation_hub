const { createBot, registerScenes } = require('./bot');
const { scene: leadScene } = require('./bot/scenes/leadScene');
const { startHandler, newLeadAction } = require('./bot/handlers/start');
const { statusHandler } = require('./bot/handlers/status');
const sheets = require('./services/sheets');
const notifier = require('./services/notifier');

async function main() {
  const bot = createBot();

  // Inject services into ctx so scenes and handlers can use them without direct imports
  bot.use((ctx, next) => {
    ctx.services = {
      sheets,
      notifier: {
        notifyManager: (lead, rowId) => notifier.notifyManager(bot, lead, rowId),
      },
    };
    return next();
  });

  registerScenes(bot, [leadScene]);

  bot.command('start', startHandler);
  bot.command('status', statusHandler);
  bot.action('new_lead', newLeadAction);
  bot.action('check_status', async (ctx) => {
    await ctx.answerCbQuery();
    await statusHandler(ctx);
  });

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
