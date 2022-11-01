import nodemailer from "nodemailer";

export async function sendMail(recipient: string, message: string, qr: Buffer) {
  let transporter = nodemailer.createTransport({
    service: "smtp.mail.ru",
    host: "smtp.mail.ru",
    auth: {
      user: "usermail", // generated ethereal user
      pass: "userpass", // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
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
