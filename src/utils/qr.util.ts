import QRCode from "qrcode";

export function generateQR(data: string): Promise<string> {
  return QRCode.toString(data, {type: 'svg', width: 192});
  //return QRCode.toBuffer(data);
}
