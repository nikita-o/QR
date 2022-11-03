import { email, emailpass } from "./../config/index";
import nodemailer from "nodemailer";

export async function sendMail(recipient: string, message: string, qr: Buffer) {
  let transporter = nodemailer.createTransport({
    service: "smtp.mail.ru",
    host: "smtp.mail.ru",
    auth: {
      user: email, // generated ethereal user
      pass: emailpass, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: email,
    to: recipient,
    subject: "Certificate",
    html: message,
    attachments: [
      {
        filename: "certificate.png",
        content: qr,
      },
    ],
  });
}
