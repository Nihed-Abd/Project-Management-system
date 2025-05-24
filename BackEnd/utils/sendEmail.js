require('dotenv').config();
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "process.env.MAIL_USER",
        pass: "process.env.MAIL_PASS"
      }
    });

    const mailOptions = {
      from: "process.env.MAIL_USER",
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to " + to);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};

module.exports = sendEmail;
