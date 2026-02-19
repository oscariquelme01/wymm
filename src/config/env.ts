import "dotenv/config";
import fs from "node:fs";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function readPrivateKey(): string {
  const fromEnv = process.env.ENABLE_BANKING_PRIVATE_KEY;
  if (fromEnv) {
    return fromEnv.replace(/\\n/g, "\n");
  }

  const path = process.env.ENABLE_BANKING_PRIVATE_KEY_PATH;
  if (path) {
    return fs.readFileSync(path, "utf8");
  }

  throw new Error(
    "Missing Enable Banking private key: set ENABLE_BANKING_PRIVATE_KEY or ENABLE_BANKING_PRIVATE_KEY_PATH"
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "./data/app.sqlite",
  enableBanking: {
    appId: requireEnv("ENABLE_BANKING_APP_ID"),
    baseUrl: process.env.ENABLE_BANKING_BASE_URL ?? "https://api.enablebanking.com",
    audience: process.env.ENABLE_BANKING_AUDIENCE ?? "api.enablebanking.com",
    redirectURL: process.env.ENABLE_BANKING_REDIRECT_URL ?? "https://jaggier-sheepishly-nubia.ngrok-free.dev/auth/callback", // some ngrook tunnel
    privateKeyPem: readPrivateKey()
  }
};
