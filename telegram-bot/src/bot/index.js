const { Telegraf, Scenes, session } = require('telegraf');
const config = require('../config');

function createBot() {
  const bot = new Telegraf(config.bot.token);

  bot.use(session());

  return bot;
}

function registerScenes(bot, scenes) {
  const stage = new Scenes.Stage(scenes);
  bot.use(stage.middleware());
}

module.exports = { createBot, registerScenes };
