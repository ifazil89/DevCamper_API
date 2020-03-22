const nodemailer = require("nodemailer");

const sendEmail = async options => {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });
    let message = await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: `${options.email}`,
        subject: `${options.subject}`,
        html: `<body style="width=50%">${options.message}</body>`
    });

    console.log("Message sent: %s", message.messageId);
};

module.exports = sendEmail;
