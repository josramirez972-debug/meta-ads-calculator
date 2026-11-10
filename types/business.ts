export type BusinessType = "services" | "ecommerce";

export type CampaignObjective =
  | "traffic"
  | "messages"
  | "whatsapp"
  | "leads"
  | "forms"
  | "conversions"
  | "ecommerce_sales"
  | "instagram_direct";

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  defaultExchangeRateToUSD: number; // 1 USD = X Local Currency
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  exchangeRateToUSD: number; // Editable rate
}

export interface SectorInfo {
  id: string;
  name: string;
  businessType: BusinessType;
  description: string;
}
