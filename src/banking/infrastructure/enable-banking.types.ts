// This are mostly AI generated and unchecked!!

export interface AspspsResponse {
  aspsps: Aspsp[];
}

export interface Aspsp {
  auth_methods: AuthMethod[];
  beta: boolean;
  bic: string;
  country: string;
  logo: string;
  maximum_consent_validity: number;
  name: string;
  payments: Payment[];
  psu_types: string[];
  required_psu_headers: string[];
}

export interface AuthMethod {
  approach: string; // e.g. "REDIRECT"
  credentials: Credential[];
  hidden_method: boolean;
  name: string;
  psu_type: string; // e.g. "business"
}

export interface Credential {
  description: string;
  name: string;
  required: boolean;
  template: string; // regex pattern as string
  title: string;
}

export interface Payment {
  allowed_auth_methods: string[];
  charge_bearer_values: string[];
  creditor_account_schemas: string[];
  creditor_agent_bic_fi_required: boolean;
  creditor_agent_clearing_system_member_id_required: boolean;
  creditor_country_required: boolean;
  creditor_name_required: boolean;
  creditor_postal_address_required: boolean;
  currencies: string[];
  debtor_account_required: boolean;
  debtor_account_schemas: string[];
  debtor_contact_email_required: boolean;
  debtor_contact_phone_required: boolean;
  debtor_currency_required: boolean;
  max_transactions: number;
  payment_type: string; // e.g. "SEPA"
  priority_codes: string[];
  psu_type: string;
  reference_number_schemas: string[];
  reference_number_supported: boolean;
  regulatory_reporting_code_required: boolean;
  remittance_information_lines: RemittanceInformationLine[];
  remittance_information_required: boolean;
  requested_execution_date_max_period: number;
  requested_execution_date_supported: boolean;
}

export interface RemittanceInformationLine {
  max_length: number;
  min_length: number;
  pattern: string; // regex pattern as string
}
