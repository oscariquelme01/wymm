export interface Account {
  name: string;
  id: string;
  type: 'wants' | 'needs';
  currency: 'EUR' | 'USD';
  institution: string;
  balance: number;
}
