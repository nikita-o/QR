import nodemailer from "nodemailer";
import { email, emailPass } from "../config/index";

const transporter = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: email,
    pass: emailPass,
  },
});

export async function sendQrToMail(
  recipient: string,
  message: string,
  qrs: Buffer[],
) {
  await transporter.sendMail({
    from: email,
    to: recipient,
    subject: "Certificate",
    html: message,
    attachments: qrs.map((qr: Buffer, index: number) => ({
      filename: `certificate (${index}).png`,
      content: qr,
    })),
  });
}
