import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Recommended for GCM

function getKeyBuffer(keyOverride?: string | null, userId?: string | null) {
  const perUser = userId ? process.env[`MASTER_KEY_${userId}`] : undefined;
  const masterKey = keyOverride || perUser || process.env.MASTER_KEY;
  if (!masterKey) {
    throw new Error("MASTER_KEY tanımlı değil. Şifreli alanlar için gerekli.");
  }
  // Normalize to 32 bytes for AES-256
  return createHash("sha256").update(masterKey).digest();
}

export function encryptSecret(plainText: string, keyOverride?: string | null, userId?: string | null): string {
  const key = getKeyBuffer(keyOverride, userId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string, keyOverride?: string | null, userId?: string | null): string {
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Geçersiz şifreli veri");
  }

  const key = getKeyBuffer(keyOverride, userId);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function hasMasterKey(userId?: string | null) {
  return Boolean((userId && process.env[`MASTER_KEY_${userId}`]) || process.env.MASTER_KEY);
}
