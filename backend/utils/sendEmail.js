const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your SpeakUp account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Welcome to SpeakUp 🎙️</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};
const sendActiveEncouragementEmail = async (toEmail, username, streakDays) => {
  const variants = [
    {
      subject: "🔥 Keep the momentum going!",
      heading: `You're on fire, ${username}!`,
      body: streakDays > 0
        ? `${streakDays} days strong — one more session today keeps your streak alive.`
        : `You're making great progress. Come back today for another quick session.`,
    },
    {
      subject: "🎯 Today's practice is waiting",
      heading: `Nice work so far, ${username}`,
      body: `Consistency is everything — a quick 5-minute session today keeps you sharp.`,
    },
    {
      subject: "🌟 You're building a great habit",
      heading: `Proud of you, ${username}!`,
      body: streakDays > 0
        ? `${streakDays}-day streak and counting. Don't stop now!`
        : `Every session adds up. Ready for today's practice?`,
    },
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const v = variants[dayOfYear % variants.length];

  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: v.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #10b981, #0b5c3d); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
          <h2 style="margin: 0 0 8px;">${v.heading}</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">${v.body}</p>
        </div>
        <div style="padding: 24px 8px; text-align: center;">
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; margin-top: 12px; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            Practice Now →
          </a>
        </div>
        <p style="text-align: center; font-size: 11px; color: #9aa79f; margin-top: 20px;">
          SpeakUp — Learn English Confidently
        </p>
      </div>
    `,
  });
};

const sendInactiveWinBackEmail = async (toEmail, username, streakDays) => {
  const variants = [
    {
      subject: "We miss you at SpeakUp! 🎙️",
      heading: `Hey ${username}, we miss you!`,
      body: streakDays > 0
        ? `You had a ${streakDays}-day streak going — don't let it fade away.`
        : `Your English speaking journey is waiting for you.`,
    },
    {
      subject: "Your streak is waiting ⏳",
      heading: `${username}, just 5 minutes today?`,
      body: streakDays > 0
        ? `You're ${streakDays} days in. One quick session keeps it alive.`
        : `Start today — even a short session builds momentum.`,
    },
    {
      subject: "Don't lose momentum 🔥",
      heading: `Come back, ${username}!`,
      body: streakDays > 0
        ? `Your ${streakDays}-day streak is close to breaking. Jump in now.`
        : `Every fluent speaker started with day 1. Let's begin.`,
    },
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const v = variants[dayOfYear % variants.length];

  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: v.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #10b981, #0b5c3d); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
          <h2 style="margin: 0 0 8px;">${v.heading}</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">${v.body}</p>
        </div>
        <div style="padding: 24px 8px; text-align: center;">
          <p style="font-size: 14px; color: #4a5a51;">
            Jump back in for just 5 minutes today and keep building your confidence.
          </p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; margin-top: 12px; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            Continue Learning →
          </a>
        </div>
        <p style="text-align: center; font-size: 11px; color: #9aa79f; margin-top: 20px;">
          SpeakUp — Learn English Confidently
        </p>
      </div>
    `,
  });
};
const sendTournamentWinEmail = async (toEmail, username, rank, periodType, points) => {
  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🏆 You placed #${rank} in the ${periodType} tournament!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #f5c518, #b8860b); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">🏆</div>
          <h2 style="margin: 0 0 8px;">Congrats, ${username}!</h2>
          <p style="margin: 0; opacity: 0.95; font-size: 14px;">
            You finished rank #${rank} in the ${periodType} tournament with ${points} points.
          </p>
        </div>
        <div style="padding: 24px 8px; text-align: center;">
          <p style="font-size: 14px; color: #4a5a51;">Your certificate is ready to view in your profile.</p>
          <a href="${process.env.CLIENT_URL}/profile" style="display: inline-block; margin-top: 12px; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            View Certificate →
          </a>
        </div>
      </div>
    `,
  });
};
const sendEventWinEmail = async (toEmail, username, rank, score) => {
  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🎉 You placed #${rank} in this week's event!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #10b981, #0b5c3d); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <h2 style="margin: 0 0 8px;">Great job, ${username}!</h2>
          <p style="margin: 0; opacity: 0.95; font-size: 14px;">
            Rank #${rank} with a score of ${score} in this week's event challenge.
          </p>
        </div>
        <div style="padding: 24px 8px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/profile" style="display: inline-block; margin-top: 12px; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            View Certificate →
          </a>
        </div>
      </div>
    `,
  });
};
const sendEventParticipateEmail = async (toEmail, username, hoursLeft) => {
  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `⏰ Only ${hoursLeft}h left — join this week's event!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #10b981, #0b5c3d); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏰</div>
          <h2 style="margin: 0 0 8px;">Last chance, ${username}!</h2>
          <p style="margin: 0; opacity: 0.95; font-size: 14px;">
            This week's event challenge closes in about ${hoursLeft} hours — you haven't submitted yet.
          </p>
        </div>
        <div style="padding: 24px 8px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/event-challenge" style="display: inline-block; margin-top: 12px; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
            Join Now →
          </a>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendActiveEncouragementEmail,
  sendInactiveWinBackEmail,
  sendTournamentWinEmail,
  sendEventWinEmail,
  sendEventParticipateEmail,
};
