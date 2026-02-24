import 'dotenv/config'
import fs from 'node:fs'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function readEnableBankingPrivateKey(): string {
  const fromEnv = process.env.ENABLE_BANKING_PRIVATE_KEY
  if (fromEnv) {
    return fromEnv.replace(/\\n/g, '\n')
  }

  const path = process.env.ENABLE_BANKING_PRIVATE_KEY_PATH
  if (path) {
    return fs.readFileSync(path, 'utf8')
  }

  throw new Error(
    'Missing Enable Banking private key: set ENABLE_BANKING_PRIVATE_KEY or ENABLE_BANKING_PRIVATE_KEY_PATH'
  )
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  frontend: {
    url: requireEnv('FRONTEND_URL')
  },
  db: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT) || 5432,
    name: requireEnv('DB_NAME'),
    password: requireEnv('DB_PASSWORD'),
    username: requireEnv('DB_USERNAME'),
  },
  enableBanking: {
    appId: requireEnv('ENABLE_BANKING_APP_ID'),
    baseUrl:
      process.env.ENABLE_BANKING_BASE_URL ?? 'https://api.enablebanking.com',
    audience: process.env.ENABLE_BANKING_AUDIENCE ?? 'api.enablebanking.com',
    redirectURL: process.env.ENABLE_BANKING_REDIRECT_URL, // some ngrook tunnel
    privateKeyPem: readEnableBankingPrivateKey(),
  },
}
