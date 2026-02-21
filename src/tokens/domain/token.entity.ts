export enum TokenTypes {
  API_TOKEN = 'apiToken',
  SESSION_TOKEN = 'sessionToken',
}

export interface Token {
  type: TokenTypes
  expiresAt: Date
  value: string
}
