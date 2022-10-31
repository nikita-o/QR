import QRCode from "qrcode";

export function generateQR(data) {
  QRCode.toFile("foo.png", data);
}

generateQR();
