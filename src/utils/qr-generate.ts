import QRCode from "qrcode";

export async function generateQR(data) {
  await QRCode.toFile("foo.png", data);
}
