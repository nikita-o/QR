import nodemailer from "nodemailer";
import { email, emailPass } from "../config/index"

const transporter = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: email,
    pass: emailPass,
  },
});

export async function sendURLPaymentToMail(recipient: string, url: string) {
  console.log(recipient);
  await transporter.sendMail({
    from: email,
    to: recipient,
    subject: "Certificate",
    text: `
    Ссылка на оплату сертификатов в ресторан: 
    ${url}
    * если вы не не собирались купить сертификат в ресторан, проигнорируйте данное письмо.
    `,
  })
    .catch((err) => {
      console.error(err);
      throw new Error('неправильный email адрес');
    });
}

export async function sendQrToMail(
  recipient: string,
  html: string,
  // qrs: Buffer[],
) {
  await transporter.sendMail({
    from: email,
    to: recipient,
    subject: "Certificate",
    html,
    // attachments: qrs.map((qr: Buffer, index: number) => ({
    //   filename: `certificate (${index}).png`,
    //   content: qr,
    // })),
  });
}
