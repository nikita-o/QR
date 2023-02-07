import QRCode from "qrcode";

export async function generateQR(data: string): Promise<string> {
  return (await QRCode.toBuffer(data)).toString('base64');
  //return QRCode.toString(data, {type: 'svg', width: 192});
  //return QRCode.toBuffer(data);
}
