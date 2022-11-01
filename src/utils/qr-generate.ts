import QRCode from "qrcode";

export function generateQR(data: string) {
  return QRCode.toBuffer(data);
}
