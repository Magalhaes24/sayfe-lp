// Utility helpers for hybrid encryption:
// RSA-OAEP (public) encrypts a randomly generated AES-GCM key,
// AES-GCM encrypts the payload. Only the admin with the private key can decrypt.

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64FromBuffer = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const bufferFromBase64 = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const pemToArrayBuffer = (pem) => {
  const trimmed = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  return bufferFromBase64(trimmed);
};

const importRsaPublicKey = (pem) =>
  crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

const importRsaPrivateKey = (pem) =>
  crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"]
  );

export const ADMIN_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn59S9Z1f0bFDpkgoy/GC
943CFWFnRoeonG+xQR0+BN/w715213V1M4SOgidCVVpSYKmw0ITFxZSFC31VsGzf
MqWGyU3Cq3zYksQW+ir1q632e4mghoa2Y43p5FWZhsn2CSMZpSN9/lsngKSZSO2T
WyapO+nFVJmtHPB8jidz6MREJpCvX170mkBcFPZNbJc8Ibsfy7+tqXM84/XVchgM
JjvWw/LNaR5B/OXDcS3yR1qDt5bnnhkqQwaPvmF+u46REz/re4/yawNB/Ifv08rI
XdVfqzunIJmD2zqE7Ihb5SqehLt+86cfKqTlLMHRgE26QUPHAn2ZoAaGse1F4PqC
yQIDAQAB
-----END PUBLIC KEY-----`;

export async function encryptForAdmin(payload) {
  if (!crypto?.subtle) {
    throw new Error("WebCrypto not available; cannot encrypt payload.");
  }

  const publicKey = await importRsaPublicKey(ADMIN_PUBLIC_KEY_PEM);
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = textEncoder.encode(JSON.stringify(payload));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  return {
    version: 1,
    algo: "RSA-OAEP/AES-GCM",
    encryptedKey: base64FromBuffer(encryptedKey),
    iv: base64FromBuffer(iv.buffer),
    ciphertext: base64FromBuffer(ciphertext),
  };
}

export async function decryptAdminPayload(docData, privateKeyPem) {
  if (!privateKeyPem) {
    throw new Error("Missing admin private key for decryption.");
  }

  const { encryptedKey, iv, ciphertext } = docData || {};
  if (!encryptedKey || !iv || !ciphertext) {
    throw new Error("Encrypted fields missing or malformed.");
  }

  const privateKey = await importRsaPrivateKey(privateKeyPem);
  const rawAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    bufferFromBase64(encryptedKey)
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(bufferFromBase64(iv)) },
    aesKey,
    bufferFromBase64(ciphertext)
  );

  const plaintext = textDecoder.decode(decryptedBuffer);
  return JSON.parse(plaintext);
}
