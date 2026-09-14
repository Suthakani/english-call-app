require("dotenv").config();
const mongoose = require("mongoose");
const { sendReminderEmails } = require("./services/reminderService");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await sendReminderEmails();
  console.log("Done");
  process.exit(0);
});