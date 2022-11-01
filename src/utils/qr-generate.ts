import QRCode from "qrcode";

export async function generateQR(data: string) {
  await QRCode.toFile("foo.png", data);
}
