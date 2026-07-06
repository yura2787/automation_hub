const { Scenes, Markup } = require('telegraf');
const { validateName, validatePhone, validateCompany, validateTask } = require('../../services/validator');

const SCENE_ID = 'lead';
const BACK = '← Back';

const backBtn = () => Markup.keyboard([[BACK]]).oneTime().resize();

const scene = new Scenes.WizardScene(
  SCENE_ID,

  // Step 0 — ask name
  async (ctx) => {
    await ctx.reply('What is your name?', backBtn());
    return ctx.wizard.next();
  },

  // Step 1 — receive name, ask phone
  async (ctx) => {
    if (ctx.message?.text === BACK) {
      await ctx.reply('Cancelled.', Markup.removeKeyboard());
      return ctx.scene.leave();
    }

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
        [BACK],
      ]).oneTime().resize(),
    );
    return ctx.wizard.next();
  },

  // Step 2 — receive phone, ask company
  async (ctx) => {
    if (ctx.message?.text === BACK) {
      await ctx.reply('What is your name?', backBtn());
      return ctx.wizard.selectStep(1);
    }

    const phone = ctx.message?.contact?.phone_number || ctx.message?.text;
    const error = validatePhone(phone);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }
    ctx.wizard.state.phone = phone.trim();

    await ctx.reply('Company name?', backBtn());
    return ctx.wizard.next();
  },

  // Step 3 — receive company, ask task
  async (ctx) => {
    if (ctx.message?.text === BACK) {
      await ctx.reply(
        'Share your phone number.',
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Share contact')],
          [BACK],
        ]).oneTime().resize(),
      );
      return ctx.wizard.selectStep(2);
    }

    const error = validateCompany(ctx.message?.text);
    if (error) {
      await ctx.reply(`❌ ${error}`);
      return;
    }
    ctx.wizard.state.company = ctx.message.text.trim();

    await ctx.reply('Describe your task.', backBtn());
    return ctx.wizard.next();
  },

  // Step 4 — receive task, save lead
  async (ctx) => {
    if (ctx.message?.text === BACK) {
      await ctx.reply('Company name?', backBtn());
      return ctx.wizard.selectStep(3);
    }

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
      const rowId = await ctx.services.sheets.saveLead(lead);
      ctx.session.lastLeadId = rowId;
      await ctx.services.notifier.notifyManager(lead, rowId);
      await ctx.reply('✅ Your request has been submitted! We will contact you soon.', Markup.removeKeyboard());
    } catch (err) {
      console.error('[leadScene] failed to save lead:', err.message);
      await ctx.reply('Something went wrong. Please try again later.');
    }

    return ctx.scene.leave();
  },
);

module.exports = { scene, SCENE_ID };
