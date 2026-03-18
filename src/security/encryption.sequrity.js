import crypto from "crypto";
import { ENCRYPTION_SECRET_KEY } from "../../config/config.service.js";


const IV_LENGTH = 16;


export const encrypt = async(text) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv
  );

  let encryptedData = cipher.update(text, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

 
  return `${iv.toString(`hex`)}:${encryptedData}`;
};


export const decrypt = async(encryptedData) => {
    if (!encryptedData) {
    throw new Error("No data to decrypt");
  }
  const [iv, encryptedText] = encryptedData.split(":");

  const binaryIv = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryIv
  );

  let decryptedData = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};