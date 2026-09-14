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
const { sendActiveEncouragementEmail, sendInactiveWinBackEmail } = require('../utils/sendEmail');

function toDateOnly(d) {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// User picks reminderTime in IST (e.g. "19:00" = 7 PM IST). Convert that
// wall-clock time to UTC hour+minute, since the server/cron runs in UTC.
const IST_OFFSET_MINUTES = 330; // UTC+5:30

function utcMinutesFromReminderTime(reminderTime) {
  if (!reminderTime) reminderTime = '19:00';
  const parts = reminderTime.split(':');
  const localHour = parseInt(parts[0], 10);
  const localMinute = parseInt(parts[1], 10) || 0;
  const safeHour = Number.isNaN(localHour) ? 19 : localHour;

  const totalMinutesIST = safeHour * 60 + localMinute;
  const totalMinutesUTC = ((totalMinutesIST - IST_OFFSET_MINUTES) + 1440) % 1440;
  return totalMinutesUTC; // 0-1439, minutes since UTC midnight
}
async function sendReminderEmails() {
  const now = new Date();
  const currentMinutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
  const todayUTC = toDateOnly(now);

  const candidates = await User.find({
    email: { $exists: true, $ne: null },
    isVerified: true,
  });

  const dueNow = candidates.filter(u => {
    const targetMinutesUTC = utcMinutesFromReminderTime(u.reminderTime);
    const diff = Math.abs(currentMinutesUTC - targetMinutesUTC);
    if (diff > 7 && diff < 1440 - 7) return false;
    if (u.lastReminderSentAt && toDateOnly(u.lastReminderSentAt).getTime() === todayUTC.getTime()) {
      return false;
    }
    return true;
  });

  console.log(`[reminderService] ${dueNow.length} user(s) due for a reminder (current UTC ${Math.floor(currentMinutesUTC / 60)}:${String(currentMinutesUTC % 60).padStart(2, '0')}).`);

  for (const user of dueNow) {
    try {
      const isActive = user.lastActiveDate && toDateOnly(user.lastActiveDate).getTime() >= todayUTC.getTime() - 86400000;

      if (isActive) {
        await sendActiveEncouragementEmail(user.email, user.username || 'there', user.streakDays || 0);
      } else {
        await sendInactiveWinBackEmail(user.email, user.username || 'there', user.streakDays || 0);
      }

      user.lastReminderSentAt = now;
      await user.save();
      console.log(`[reminderService] Sent ${isActive ? 'encouragement' : 'win-back'} email to ${user.email}`);
    } catch (err) {
      console.error(`[reminderService] Failed to email ${user.email}:`, err.message);
    }
  }
}

function startReminderCron() {
  cron.schedule('*/15 * * * *', () => {
    console.log('[reminderService] Hourly reminder check running...');
    sendReminderEmails().catch(err => console.error('[reminderService] Job failed:', err));
  });
  console.log('[reminderService] Cron job scheduled (every 15 min, per-user reminderTime).');
}

module.exports = { startReminderCron, sendReminderEmails };