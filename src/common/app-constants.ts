export const APP_MODULES = {
  BANKING: 'banking',
  CATEGORIES: 'categories',
  DEBTS: 'debts',
  SNAPSHOTS: 'snapshots',
  TRANSACTIONS: 'transactions',
  TOKENS: 'tokens',
  ACCOUNTS: 'accounts',
};

export type APP_MODULE = (typeof APP_MODULES)[keyof typeof APP_MODULES];
