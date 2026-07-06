const { SCENE_ID } = require('../scenes/leadScene');

async function startHandler(ctx) {
  await ctx.scene.enter(SCENE_ID);
}

module.exports = { startHandler };
