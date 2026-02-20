export interface GenerateAuthUrlDTO {
  institutionId: string
  country: string
}

export interface IBankingProvider {
  makeRequest<T>(path: string, method: string, body: object): Promise<T>
}

export const BANKING_PROVIDER = 'BANKING_PROVIDER'
