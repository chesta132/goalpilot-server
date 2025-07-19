import crypto from "crypto";

const key = Buffer.from(process.env.BASE64_SECRET!, "base64");
const algorithm = "aes-256-cbc";

export const encrypt = (data: any) => {
  let stringifyData = data;
  if (typeof data !== "string") {
    stringifyData = JSON.stringify(data);
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(stringifyData, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encrypted?: string | null, options?: { parse?: boolean }) => {
  if (!encrypted) return "";

  const parts = encrypted.split(":");
  if (parts.length !== 2) {
    console.error("Invalid chipper format.");
    return null;
  }
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    if (options?.parse) {
      try {
        return JSON.parse(decrypted);
      } catch {
        return null;
      }
    }
    return decrypted;
  } catch (e) {
    console.error("Failed while decrypting:", e);
    return null;
  }
};

export function generateEncryptionKey() {
  const buffer = crypto.randomBytes(32);
  const encodedKey = buffer.toString("base64");
  console.log(`Base 64 encoded encryption key: ${encodedKey}`);
}
