import QRCode from "qrcode";
import { hostFront } from "../config";

export async function generateQR(id: string): Promise<void> {
  await QRCode.toFile(`static/qr/${id}.png`, `${hostFront}/accept-certificate.html?id=${id}`, {width: 192});
  // return (await QRCode.toBuffer(`${hostFront}/accept-certificate.html?id=${id}`)).toString('base64');
  //return QRCode.toString(data, {type: 'svg', width: 192});
  //return QRCode.toBuffer(data);
}
