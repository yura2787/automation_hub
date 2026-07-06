const { Scenes, Markup } = require('telegraf');
const { validateName, validatePhone, validateCompany, validateTask } = require('../../services/validator');

const SCENE_ID = 'lead';

const scene = new Scenes.WizardScene(
  SCENE_ID,

  // Step 1 — name
  async (ctx) => {
    await ctx.reply('What is your name?');
    return ctx.wizard.next();
  },

  // Step 2 — phone
  async (ctx) => {
    const error = validateName(ctx.message?.text);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }
    ctx.wizard.state.name = ctx.message.text.trim();

    await ctx.reply(
      'Share your phone number.',
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Share contact')],
      ]).oneTime().resize(),
    );
    return ctx.wizard.next();
  },

  // Step 3 — company
  async (ctx) => {
    const phone = ctx.message?.contact?.phone_number || ctx.message?.text;
    const error = validatePhone(phone);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }
    ctx.wizard.state.phone = phone.trim();

    await ctx.reply('Company name?', Markup.removeKeyboard());
    return ctx.wizard.next();
  },

  // Step 4 — task description
  async (ctx) => {
    const error = validateCompany(ctx.message?.text);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }
    ctx.wizard.state.company = ctx.message.text.trim();

    await ctx.reply('Describe your task.');
    return ctx.wizard.next();
  },

  // Final step — save lead
  async (ctx) => {
    const error = validateTask(ctx.message?.text);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }

    const lead = {
      name: ctx.wizard.state.name,
      phone: ctx.wizard.state.phone,
      company: ctx.wizard.state.company,
      task: ctx.message.text.trim(),
      userId: ctx.from.id,
      date: new Date().toISOString(),
    };

    ctx.session.lastLeadId = null;

    try {
      // sheets and notifier are injected via ctx.services (wired in feat/bot-services)
      const rowId = await ctx.services.sheets.saveLead(lead);
      ctx.session.lastLeadId = rowId;
      await ctx.services.notifier.notifyManager(lead, rowId);
      await ctx.reply('✅ Your request has been submitted! We will contact you soon.');
    } catch (err) {
      console.error('[leadScene] failed to save lead:', err.message);
      await ctx.reply('Something went wrong. Please try again later.');
    }

    return ctx.scene.leave();
  },
);

module.exports = { scene, SCENE_ID };
