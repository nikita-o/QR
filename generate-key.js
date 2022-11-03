const crypto = require("crypto");
const fs = require("fs");

const securityKey = crypto.randomBytes(32);
const initVector = crypto.randomBytes(16);

fs.writeFileSync(
  "./src/config/key.json",
  JSON.stringify({ securityKey, initVector })
);
