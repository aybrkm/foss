const ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export function isValidMasterCode(code: string) {
  if (!/^\d{6}$/.test(code)) {
    return false;
  }
  for (let i = 0; i < code.length - 2; i += 1) {
    if (code[i] === code[i + 1] && code[i] === code[i + 2]) {
      return false;
    }
  }
  return true;
}

export async function encryptWithMasterCode(plainText: string, masterCode: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(masterCode, salt);
  const encoded = new TextEncoder().encode(plainText);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  const cipher = new Uint8Array(cipherBuffer);
  return `v1:${toHex(salt)}:${toHex(iv)}:${toHex(cipher)}`;
}

export async function decryptWithMasterCode(payload: string, masterCode: string) {
  const [version, saltHex, ivHex, dataHex] = payload.split(":");
  if (version !== "v1" || !saltHex || !ivHex || !dataHex) {
    throw new Error("Geçersiz şifre formatı");
  }
  const salt = fromHex(saltHex);
  const iv = fromHex(ivHex);
  const data = fromHex(dataHex);
  const key = await deriveKey(masterCode, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new TextDecoder().decode(decrypted);
}

export async function decryptAnyWithMasterCode(payload: string, masterCode: string) {
  if (payload.startsWith("v1:")) {
    return decryptWithMasterCode(payload, masterCode);
  }
  // Legacy format iv:authTag:cipher (hex) — try decoding with masterCode-derived key
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Geçersiz şifre formatı");
  }
  const [ivHex, authTagHex, dataHex] = parts;
  const iv = fromHex(ivHex);
  const authTag = fromHex(authTagHex);
  const data = fromHex(dataHex);

  const keyRaw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(masterCode));
  const key = await crypto.subtle.importKey("raw", keyRaw, { name: "AES-GCM" }, false, ["decrypt"]);
  const combined = new Uint8Array(data.length + authTag.length);
  combined.set(data);
  combined.set(authTag, data.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    combined,
  );
  return new TextDecoder().decode(decrypted);
}

async function deriveKey(masterCode: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterCode),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.slice().buffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return array;
}
