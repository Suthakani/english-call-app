const cron = require('node-cron');
const Event = require('../models/Event');
const EventSubmission = require('../models/EventSubmission');
const User = require('../models/User');
const { sendEventParticipateEmail } = require('../utils/sendEmail');

// Runs every hour. If the current event is "live" and has less than
// 12 hours left, email verified users who haven't submitted yet —
// but only once per event (tracked via lastEventReminderKey on User).
async function sendEventParticipateReminders() {
  const now = new Date();
  const event = await Event.findOne({ status: 'live' });
  if (!event) return;

  const hoursLeft = (new Date(event.endsAt).getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft > 12 || hoursLeft <= 0) return;

  const submitted = await EventSubmission.find({ periodKey: event.periodKey, status: 'completed' }).select('user');
  const submittedIds = new Set(submitted.map(s => String(s.user)));

  const candidates = await User.find({
    isVerified: true,
    email: { $exists: true, $ne: null },
    lastEventReminderKey: { $ne: event.periodKey },
  }).select('email username _id');

  const toRemind = candidates.filter(u => !submittedIds.has(String(u._id)));

  console.log(`[eventReminderService] ${toRemind.length} user(s) to remind for event ${event.periodKey}`);

  for (const user of toRemind) {
    try {
      await sendEventParticipateEmail(user.email, user.username, Math.round(hoursLeft));
      user.lastEventReminderKey = event.periodKey;
      await user.save();
    } catch (err) {
      console.error(`[eventReminderService] Failed to email ${user.email}:`, err.message);
    }
  }
}

function startEventReminderCron() {
  cron.schedule('0 * * * *', () => {
    sendEventParticipateReminders().catch(err => console.error('[eventReminderService] Job failed:', err));
  });
  console.log('[eventReminderService] Cron job scheduled (hourly, event participation reminders).');
}

module.exports = { startEventReminderCron, sendEventParticipateReminders };