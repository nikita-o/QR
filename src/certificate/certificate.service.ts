import { Certificate } from "./../entities/certificate.entity";
import { initVector, ngrockHost } from "./../config/index";
import { encrypt, decrypt } from "../utils/crypt";
import { generateQR } from "../utils/qr-generate";
import { sendMail } from "../utils/send-mail";
import { myDataSource } from "../app-data-source";

export async function createCertificate(data: any) {
  data.accept = false;
  data.createDate = Date.now();

  await myDataSource.getRepository(Certificate).save(data);

  const encryptId = encrypt(data.id); //должна быть строка
  const url = `${ngrockHost}/close-certificate/?encryptId=${encryptId}`;
  const qr: Buffer = await generateQR(url);
  await sendMail(data.email, "QR код вашего сертификата", qr);
}

export async function acceptCertificate(encryptId: string) {
  const id = decrypt(encryptId);
  const certificate: Certificate | null = await myDataSource
    .getRepository(Certificate)
    .findOneBy({ id });
  if (!certificate) {
    return { error: "Данные не корректны" };
  }

  if (certificate.accept) {
    return { error: "Сертификат уже погашен" };
  }
  certificate.accept = true;
  await myDataSource.getRepository(Certificate).save(certificate);
  return {
    email: certificate.email,
    price: certificate.price,
    restaurant: certificate.restaurant,
  };
}
