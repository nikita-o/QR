import nodemailer from "nodemailer";
import { email, emailPass } from "../config/index"
import * as puppeteer from 'puppeteer';
import { Page } from "puppeteer";

let page: Page;

export async function initMail() {
  // Create a browser instance
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ]
  });
  // Create a new page
  page = await browser.newPage();
  await page.setViewport({ width: 1250, height: 900 });
}

const transporter = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: email,
    pass: emailPass,
  },
});

export async function sendURLPaymentToMail(recipient: string, url: string) {
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
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    // margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
    printBackground: true,
    format: 'A4',
  });

  await transporter.sendMail({
    from: email,
    to: recipient,
    subject: "Certificate",
    html,
    attachments: [{
      filename: 'certificate.pdf',
      content: pdf,
    }],
  });
}
