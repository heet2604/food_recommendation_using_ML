const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '7x!A%D*G-KaPdSgVkYp3s6v9y$B?E*H+', 'utf-8');
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function encrypt(text) {
  try {
    console.log("🔐 Encrypting:", typeof text, text);
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const result = iv.toString('hex') + ':' + encrypted.toString('hex');
    console.log("✅ Encryption successful, result length:", result.length);
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

function decrypt(text) {
  try {
    console.log("🔓 Decrypting input:", typeof text, text);
    
    // If it's already a number (old data), return as is
    if (typeof text === 'number') {
      console.log("📊 Returning numeric value as string");
      return text.toString();
    }
    
    // If it doesn't look like encrypted data (no colon), return as is
    if (typeof text !== 'string' || !text.includes(':')) {
      console.log("📝 Returning plain string value");
      return text;
    }
    
    // It's encrypted data - decrypt it
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    console.log("✅ Decryption successful");
    return decrypted.toString();
  } catch (error) {
    console.error('❌ Decryption error:', error.message);
    // Return original text if decryption fails
    return text.toString();
  }
}

module.exports = { encrypt, decrypt };