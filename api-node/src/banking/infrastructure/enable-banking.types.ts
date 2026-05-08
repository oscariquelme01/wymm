// This are mostly AI generated and unchecked!!

export interface AspspsResponse {
  aspsps: Aspsp[]
}

export interface ErrorResponse {
  message: string
  code: number,
  error: string,
  detail: unknown
}

export interface Aspsp {
  auth_methods: AuthMethod[]
  beta: boolean
  bic: string
  country: string
  logo: string
  maximum_consent_validity: number
  name: string
  payments: Payment[]
  psu_types: string[]
  required_psu_headers: string[]
}

export interface AuthMethod {
  approach: string // e.g. "REDIRECT"
  credentials: Credential[]
  hidden_method: boolean
  name: string
  psu_type: string // e.g. "business"
}

export interface Credential {
  description: string
  name: string
  required: boolean
  template: string // regex pattern as string
  title: string
}

export interface Payment {
  allowed_auth_methods: string[]
  charge_bearer_values: string[]
  creditor_account_schemas: string[]
  creditor_agent_bic_fi_required: boolean
  creditor_agent_clearing_system_member_id_required: boolean
  creditor_country_required: boolean
  creditor_name_required: boolean
  creditor_postal_address_required: boolean
  currencies: string[]
  debtor_account_required: boolean
  debtor_account_schemas: string[]
  debtor_contact_email_required: boolean
  debtor_contact_phone_required: boolean
  debtor_currency_required: boolean
  max_transactions: number
  payment_type: string // e.g. "SEPA"
  priority_codes: string[]
  psu_type: string
  reference_number_schemas: string[]
  reference_number_supported: boolean
  regulatory_reporting_code_required: boolean
  remittance_information_lines: RemittanceInformationLine[]
  remittance_information_required: boolean
  requested_execution_date_max_period: number
  requested_execution_date_supported: boolean
}

export interface RemittanceInformationLine {
  max_length: number
  min_length: number
  pattern: string // regex pattern as string
}

export interface AuthorizeSessionResponse {
  session_id: string
  accounts: Account[]
  aspsp: AspspInfo
  psu_type: string
  access: Access
}

export interface Account {
  account_id: AccountId
  all_account_ids: AccountIdentifier[]
  account_servicer: AccountServicer
  name: string
  details: string
  usage: string // e.g. "PRIV"
  cash_account_type: string // e.g. "CACC"
  product: string
  currency: string
  psu_status: string
  credit_limit?: CreditLimit
  legal_age: boolean
  postal_address?: PostalAddress
  uid: string
  identification_hash: string
  identification_hashes: string[]
}

export interface AccountId {
  iban: string
}

export interface AccountIdentifier {
  identification: string
  scheme_name: string
}

export interface AccountServicer {
  bic_fi: string
  clearing_system_member_id?: ClearingSystemMemberId
  name: string
}

export interface ClearingSystemMemberId {
  clearing_system_id: string
  member_id: number
}

export interface CreditLimit {
  currency: string
  amount: string
}

export interface PostalAddress {
  address_type: string
  department?: string
  sub_department?: string
  street_name: string
  building_number: string
  post_code: string
  town_name: string
  country_sub_division?: string
  country: string
  address_line: string[]
}

export interface AspspInfo {
  name: string
  country: string
}

export interface Access {
  valid_until: string // ISO date string
}

export interface SessionDataResponse {
  access: Access
  accounts: string[] // array of account UIDs
  accounts_data: AccountReference[]
  aspsp: AspspInfo
  authorized: string // ISO datetime string
  created: string // ISO datetime string
  psu_type: string // e.g. "business"
  status: string // e.g. "AUTHORIZED"
}

export interface AccountReference {
  identification_hash: string
  uid: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  continuation_key?: string
}

export interface Transaction {
  entry_reference: string
  merchant_category_code?: string

  transaction_amount: Amount

  creditor?: Party
  creditor_account?: AccountId
  creditor_agent?: AccountServicer

  debtor?: Party
  debtor_account?: AccountId
  debtor_agent?: AccountServicer

  bank_transaction_code?: BankTransactionCode

  credit_debit_indicator: string // e.g. "CRDT" | "DBIT"
  status: string // e.g. "BOOK"

  booking_date?: string // YYYY-MM-DD
  value_date?: string // YYYY-MM-DD
  transaction_date?: string // YYYY-MM-DD

  balance_after_transaction?: Amount

  reference_number?: string
  reference_number_schema?: string

  remittance_information?: string[]

  debtor_account_additional_identification?: AccountIdentifier
  creditor_account_additional_identification?: AccountIdentifier

  exchange_rate?: ExchangeRate

  note?: string
  transaction_id?: string
}

export interface Amount {
  currency: string
  amount: string // kept as string to preserve precision
}

export interface Party {
  name?: string
  postal_address?: PostalAddress
}

export interface BankTransactionCode {
  description?: string
  code?: string
  sub_code?: string
}

export interface ExchangeRate {
  unit_currency: string
  exchange_rate: string
  rate_type?: string // e.g. "SPOT"
  contract_identification?: string
  instructed_amount?: Amount
}

export interface BalancesResponse {
  balances: Balance[]
}

export interface Balance {
  name?: string
  balance_amount: Amount
  balance_type: string
  last_change_date_time?: string
  reference_date?: string
  last_committed_transaction?: string
}

export function isErrorResponse<T extends Object>(response: ErrorResponse | T): response is ErrorResponse {
  return "error" in response && "code" in response && "message" in response && "detail" in response
}
