const nodemailer = require('nodemailer')

// Email configuration
const mailConfig = {
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false,
  auth: {
    user: "emailapikey",
    pass: process.env.SMTP_PASSWORD,
  },
};


// Function to send email
async function sendEmail({from, subject, body, toAddress, ccAddress, attachments}) {
  let transporter = nodemailer.createTransport(mailConfig);

  let mailOptions = {
    from: from || "noreply@mnivesh.niveshonline.com",
    to: toAddress,
    cc: ccAddress,
    subject: subject,
    html: body,
    attachments: attachments
  };

  try {
    let mailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", mailResponse.messageId);
    return mailResponse.messageId
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
}

module.exports = sendEmail;