const nodemailer = require("nodemailer");

const sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    if (!firstName || !email || !message) {
      return res.status(400).json({ message: "Please fill in the required fields" });
    }

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[SpeakUp Contact] ${subject || "New message"}`,
      text: `From: ${firstName} ${lastName || ""} (${email})\n\n${message}`,
      html: `<p><strong>From:</strong> ${firstName} ${lastName || ""} (${email})</p><p>${message}</p>`,
    });

    res.json({ message: "Message sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not send message", error: error.message });
  }
};

module.exports = { sendContactMessage };