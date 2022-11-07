import QRCode from "qrcode";

export function generateQR(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data);
}
