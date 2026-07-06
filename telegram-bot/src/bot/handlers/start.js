const { Markup } = require('telegraf');
const { SCENE_ID } = require('../scenes/leadScene');

async function startHandler(ctx) {
  await ctx.reply(
    'Welcome to Automation Hub! 👋\n\nHow can I help you?',
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Submit a request', 'new_lead')],
      [Markup.button.callback('📋 Check my status', 'check_status')],
    ]),
  );
}

async function newLeadAction(ctx) {
  await ctx.answerCbQuery();
  await ctx.scene.enter(SCENE_ID);
}

module.exports = { startHandler, newLeadAction };
