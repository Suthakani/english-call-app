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

// Sent from the Admin Dashboard's "At Risk Users" panel — a branded
// nudge to bring back a learner who's gone quiet. Kept visually
// consistent with sendVerificationEmail's template above.
const sendReminderEmail = async (toEmail, username, streakDays) => {
  await transporter.sendMail({
    from: `"SpeakUp English" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "We miss you at SpeakUp! 🎙️",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1a2e24;">
        <div style="background: linear-gradient(135deg, #10b981, #0b5c3d); border-radius: 12px; padding: 28px 24px; text-align: center; color: #fff;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
          <h2 style="margin: 0 0 8px;">Hey ${username}, we miss you!</h2>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">
            ${streakDays > 0
              ? `You had a ${streakDays}-day streak going — don't let it fade away.`
              : `Your English speaking journey is waiting for you.`}
          </p>
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

module.exports = { sendVerificationEmail, sendReminderEmail };