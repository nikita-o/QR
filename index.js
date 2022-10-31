const QRCode = require('qrcode');

function generateQR(data) {
    QRCode.toFile(
        'foo.png',
        JSON.stringify(data),
    );
}

generateQR({test: 123});

function encrypt(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Securitykey, initVector);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
}

function decrypt(data) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Securitykey, initVector);
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
}

// const crypto = require("crypto");
//
// const algorithm = "aes-256-cbc";
//
// const data = {test: 123};
// const initVector = crypto.randomBytes(16);
//
// const message = JSON.stringify(data);
//
// const Securitykey = crypto.randomBytes(32);
//
// const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
//
// let encryptedData = cipher.update(message, "utf-8", "hex");
//
// encryptedData += cipher.final("hex");
//
// console.log("Encrypted message: " + encryptedData);

// the decipher function
const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

decryptedData += decipher.final("utf8");

console.log("Decrypted message: " + decryptedData);
console.log("Decrypted message (json to obj): ");
console.log(JSON.parse(decryptedData))