import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  // Validate inputs (don't trust anyone)
  if (!to || !subject || !html) {
    throw new Error("Missing email parameters");
  }

  // console.log(`to->${to} subject ->${subject}, html-> ${html}`)
  const transporter = nodemailer.createTransport({
    service: "gmail",        // You can change this (Outlook, SES, etc.)
    host:"smtp.gmail.com",
    port:587,
    secure:true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail app password, NOT your real password
    },
  });

  const mailOptions = {
    from: `"AutoFill360" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
