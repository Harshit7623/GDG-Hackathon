const crypto = require('crypto');
require("dotenv").config();

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

exports.decrypt = (encryptedText) => {
    let parts = encryptedText.split(':');
    let decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(parts[0], 'hex'));
    let decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
    return decrypted.toString();
};
