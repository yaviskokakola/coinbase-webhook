import { SubscriptionType } from "@prisma/client";

export interface Root {
  id: string;
  scheduled_for: string;
  attempt_number: number;
  event: Event;
}

export interface Event {
  id: string;
  resource: string;
  type: ChargeStatus;
  api_version: string;
  created_at: string;
  data: Data;
}

type ChargeStatus =
  | "charge:created"
  | "charge:confirmed"
  | "charge:failed"
  | "charge:delayed"
  | "charge:pending"
  | "charge:resolved";

export interface Data {
  code: string;
  id: string;
  resource: string;
  name: string;
  description: string;
  hosted_url: string;
  created_at: string;
  confirmed_at: string;
  expires_at: string;
  support_email: string;
  timeline: Timeline[];
  metadata: Metadata;
  payment_threshold: PaymentThreshold;
  pricing: Pricing;
  pricing_type: string;
  payments: Payment2[];
  addresses: Addresses;
  exchange_rates: ExchangeRates;
  local_exchange_rates: LocalExchangeRates;
  pwcb_only: boolean;
  offchain_eligible: boolean;
  coinbase_managed_merchant: boolean;
  fee_rate: number;
}

export interface Timeline {
  time: string;
  status: string;
  payment?: Payment;
}

export interface Payment {
  network: string;
  transaction_id: string;
}

export interface Metadata {
  userId: string,
  paymentId: string,
  type: SubscriptionType,
  username: string
}

export interface PaymentThreshold {
  overpayment_absolute_threshold: OverpaymentAbsoluteThreshold;
  overpayment_relative_threshold: string;
  underpayment_absolute_threshold: UnderpaymentAbsoluteThreshold;
  underpayment_relative_threshold: string;
}

export interface OverpaymentAbsoluteThreshold {
  amount: string;
  currency: string;
}

export interface UnderpaymentAbsoluteThreshold {
  amount: string;
  currency: string;
}

export interface Pricing {
  local: Local;
  bitcoin: Bitcoin;
  ethereum: Ethereum;
  dai: Dai;
  usdc: Usdc;
  bitcoincash: Bitcoincash;
  litecoin: Litecoin;
}

export interface Local {
  amount: string;
  currency: string;
}

export interface Bitcoin {
  amount: string;
  currency: string;
}

export interface Ethereum {
  amount: string;
  currency: string;
}

export interface Dai {
  amount: string;
  currency: string;
}

export interface Usdc {
  amount: string;
  currency: string;
}

export interface Bitcoincash {
  amount: string;
  currency: string;
}

export interface Litecoin {
  amount: string;
  currency: string;
}

export interface Payment2 {
  network: string;
  transaction_id: string;
  status: string;
  detected_at: string;
  value: Value;
  block: Block;
}

export interface Value {
  local: Local2;
  crypto: Crypto;
}

export interface Local2 {
  amount: string;
  currency: string;
}

export interface Crypto {
  amount: string;
  currency: string;
}

export interface Block {
  height: number;
  hash: string;
  confirmations_accumulated: number;
  confirmations_required: number;
}

export interface Addresses {
  bitcoin: string;
  ethereum: string;
  dai: string;
  usdc: string;
  litecoin: string;
  bitcoincash: string;
}

export interface ExchangeRates {
  "BCH-USD": string;
  "BTC-USD": string;
  "ETH-USD": string;
  "JPY-USD": string;
  "LTC-USD": string;
  "TST-USD": string;
  "BEER-USD": string;
}

export interface LocalExchangeRates {
  "BCH-USD": string;
  "BTC-USD": string;
  "ETH-USD": string;
  "JPY-USD": string;
  "LTC-USD": string;
  "TST-USD": string;
  "BEER-USD": string;
}
