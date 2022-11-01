import {createTransport, Transporter} from "nodemailer";

export async function sendMail(recipient: string, message: string, qr: Buffer): Promise<void> {
  const transporter: Transporter = createTransport({
    service: "smtp.mail.ru",
    host: "smtp.mail.ru",
    auth: {
      user: "usermail", // generated ethereal user
      pass: "userpass", // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: "usermail",
    to: recipient,
    subject: "message",
    // text: message,
    html: message,
    attachments: [
      {
        // filename and content type is derived from path
        filename: "filename.png",
        content: qr,
      },
    ],
  });
}
