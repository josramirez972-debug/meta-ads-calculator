import { CountryInfo, CurrencyConfig } from "@/types/business";

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "Dólar Estadounidense", exchangeRateToUSD: 1.0 },
  COP: { code: "COP", symbol: "$", name: "Peso Colombiano", exchangeRateToUSD: 4150.0 },
  MXN: { code: "MXN", symbol: "$", name: "Peso Mexicano", exchangeRateToUSD: 19.8 },
  ARS: { code: "ARS", symbol: "$", name: "Peso Argentino", exchangeRateToUSD: 1040.0 },
  CLP: { code: "CLP", symbol: "$", name: "Peso Chileno", exchangeRateToUSD: 940.0 },
  PEN: { code: "PEN", symbol: "S/", name: "Sol Peruano", exchangeRateToUSD: 3.75 },
  BRL: { code: "BRL", symbol: "R$", name: "Real Brasileño", exchangeRateToUSD: 5.7 },
  BOB: { code: "BOB", symbol: "Bs", name: "Boliviano", exchangeRateToUSD: 6.96 },
  UYU: { code: "UYU", symbol: "$U", name: "Peso Uruguayo", exchangeRateToUSD: 42.0 },
  PYG: { code: "PYG", symbol: "₲", name: "Guaraní Paraguayo", exchangeRateToUSD: 7800.0 },
  CRC: { code: "CRC", symbol: "₡", name: "Colón Costarricense", exchangeRateToUSD: 510.0 },
  GTQ: { code: "GTQ", symbol: "Q", name: "Quetzal Guatemalteco", exchangeRateToUSD: 7.72 },
  DOP: { code: "DOP", symbol: "RD$", name: "Peso Dominicano", exchangeRateToUSD: 60.5 },
  HNL: { code: "HNL", symbol: "L", name: "Lempira Hondureño", exchangeRateToUSD: 25.1 },
  NIO: { code: "NIO", symbol: "C$", name: "Córdoba Nicaragüense", exchangeRateToUSD: 36.8 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", exchangeRateToUSD: 0.92 },
};

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { name: "Colombia", code: "CO", flag: "🇨🇴", currencyCode: "COP", currencySymbol: "$", defaultExchangeRateToUSD: 4150.0 },
  { name: "México", code: "MX", flag: "🇲🇽", currencyCode: "MXN", currencySymbol: "$", defaultExchangeRateToUSD: 19.8 },
  { name: "Estados Unidos", code: "US", flag: "🇺🇸", currencyCode: "USD", currencySymbol: "$", defaultExchangeRateToUSD: 1.0 },
  { name: "España", code: "ES", flag: "🇪🇸", currencyCode: "EUR", currencySymbol: "€", defaultExchangeRateToUSD: 0.92 },
  { name: "Argentina", code: "AR", flag: "🇦🇷", currencyCode: "ARS", currencySymbol: "$", defaultExchangeRateToUSD: 1040.0 },
  { name: "Chile", code: "CL", flag: "🇨🇱", currencyCode: "CLP", currencySymbol: "$", defaultExchangeRateToUSD: 940.0 },
  { name: "Perú", code: "PE", flag: "🇵🇪", currencyCode: "PEN", currencySymbol: "S/", defaultExchangeRateToUSD: 3.75 },
  { name: "Brasil", code: "BR", flag: "🇧🇷", currencyCode: "BRL", currencySymbol: "R$", defaultExchangeRateToUSD: 5.7 },
  { name: "Venezuela", code: "VE", flag: "🇻🇪", currencyCode: "USD", currencySymbol: "$", defaultExchangeRateToUSD: 1.0 },
  { name: "Ecuador", code: "EC", flag: "🇪🇨", currencyCode: "USD", currencySymbol: "$", defaultExchangeRateToUSD: 1.0 },
  { name: "Bolivia", code: "BO", flag: "🇧🇴", currencyCode: "BOB", currencySymbol: "Bs", defaultExchangeRateToUSD: 6.96 },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", currencyCode: "UYU", currencySymbol: "$U", defaultExchangeRateToUSD: 42.0 },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", currencyCode: "PYG", currencySymbol: "₲", defaultExchangeRateToUSD: 7800.0 },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", currencyCode: "CRC", currencySymbol: "₡", defaultExchangeRateToUSD: 510.0 },
  { name: "Panamá", code: "PA", flag: "🇵🇦", currencyCode: "USD", currencySymbol: "$", defaultExchangeRateToUSD: 1.0 },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", currencyCode: "GTQ", currencySymbol: "Q", defaultExchangeRateToUSD: 7.72 },
  { name: "República Dominicana", code: "DO", flag: "🇩🇴", currencyCode: "DOP", currencySymbol: "RD$", defaultExchangeRateToUSD: 60.5 },
  { name: "El Salvador", code: "SV", flag: "🇸🇻", currencyCode: "USD", currencySymbol: "$", defaultExchangeRateToUSD: 1.0 },
  { name: "Honduras", code: "HN", flag: "🇭🇳", currencyCode: "HNL", currencySymbol: "L", defaultExchangeRateToUSD: 25.1 },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", currencyCode: "NIO", currencySymbol: "C$", defaultExchangeRateToUSD: 36.8 },
];

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  maximumFractionDigits: number = 2
): string {
  if (isNaN(amount) || !Number.isFinite(amount)) return "$0.00";
  const curr = SUPPORTED_CURRENCIES[currencyCode];
  const symbol = curr ? curr.symbol : "$";
  
  // Format with localized thousands and decimals
  const formatted = amount.toLocaleString("es-ES", {
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  });

  return `${symbol} ${formatted} ${currencyCode}`;
}
