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

module.exports = { sendVerificationEmail };
