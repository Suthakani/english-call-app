// backend/services/reminderService.js
//
// Runs every hour. Sends a re-engagement email (reusing your existing
// sendReminderEmail from utils/sendEmail.js — the same one your Admin
// Dashboard's "At Risk Users" panel already uses) to any user whose
// lastActiveDate is BEFORE today's UTC date and whose personal
// reminderTime matches the current hour, and who hasn't already been
// emailed today.
//
// SETUP:
// 1. npm install node-cron   (nodemailer already installed/used)
// 2. Adjust the require path below if utils/sendEmail.js lives somewhere
//    other than backend/utils/sendEmail.js
// 3. Confirm activityRoutes.js correctly wires POST /ping to pingActivity
//    (so lastActiveDate actually gets updated when users visit)
// 4. In server.js:
//      const { startReminderCron } = require('./services/reminderService');
//      startReminderCron();

const cron = require('node-cron');
const User = require('../models/User');
const { sendReminderEmail } = require('../utils/sendEmail');

function toDateOnly(d) {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// "19:00" -> 19
function hourFromReminderTime(reminderTime) {
  if (!reminderTime) return 19;
  const parts = reminderTime.split(':');
  const n = parseInt(parts[0], 10);
  return Number.isNaN(n) ? 19 : n;
}

async function sendReminderEmails() {
  const now = new Date();
  const currentHour = now.getHours();
  const todayUTC = toDateOnly(now);

  const candidates = await User.find({
    email: { $exists: true, $ne: null },
    isVerified: true,
    $or: [{ lastActiveDate: null }, { lastActiveDate: { $lt: todayUTC } }],
  });

  const dueNow = candidates.filter(u => {
    if (hourFromReminderTime(u.reminderTime) !== currentHour) return false;
    if (u.lastReminderSentAt && toDateOnly(u.lastReminderSentAt).getTime() === todayUTC.getTime()) {
      return false;
    }
    return true;
  });

  console.log(`[reminderService] ${dueNow.length} user(s) due for a reminder at hour ${currentHour}.`);

  for (const user of dueNow) {
    try {
      await sendReminderEmail(user.email, user.username || 'there', user.streakDays || 0);
      user.lastReminderSentAt = now;
      await user.save();
      console.log(`[reminderService] Sent reminder to ${user.email}`);
    } catch (err) {
      console.error(`[reminderService] Failed to email ${user.email}:`, err.message);
    }
  }
}

function startReminderCron() {
  cron.schedule('0 * * * *', () => {
    console.log('[reminderService] Hourly reminder check running...');
    sendReminderEmails().catch(err => console.error('[reminderService] Job failed:', err));
  });
  console.log('[reminderService] Cron job scheduled (hourly, per-user reminderTime).');
}

module.exports = { startReminderCron, sendReminderEmails };