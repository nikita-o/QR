import nodemailer from "nodemailer";
import { email, emailPass } from "../config/index";

const transporter = nodemailer.createTransport({
  service: "smtp.mail.ru",
  host: "smtp.mail.ru",
  auth: {
    user: email,
    pass: emailPass,
  },
});

export async function sendQrToMail(
  recipient: string,
  message: string,
  qr: Buffer,
) {
  await transporter.sendMail({
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
