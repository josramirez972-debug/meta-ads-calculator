import { SectorInfo, BusinessType, CampaignObjective } from "@/types/business";
import {
  BenchmarkRecord,
  ConfidenceLevel,
  ResolvedBenchmarkPackage,
} from "@/types/benchmarks";
import { SUPPORTED_CURRENCIES } from "@/lib/currency/countries";

export const SECTORS: SectorInfo[] = [
  // Services & Digital Products
  {
    id: "coaching_mentoring",
    name: "Mentorías y Coaching",
    businessType: "services",
    description: "Programas individuales y grupales de alto valor.",
  },
  {
    id: "online_courses",
    name: "Cursos Online y Academias",
    businessType: "services",
    description: "Infoproductos, membresías y formación digital.",
  },
  {
    id: "professional_services",
    name: "Servicios Profesionales y Consultoría",
    businessType: "services",
    description: "Abogados, contadores, agencias y consultores B2B.",
  },
  {
    id: "health_fitness",
    name: "Salud, Estética y Fitness",
    businessType: "services",
    description: "Entrenadores, nutricionistas y clínicas especializadas.",
  },
  {
    id: "real_estate_services",
    name: "Bienes Raíces y Proyectos",
    businessType: "services",
    description: "Captación de inversionistas y compradores de inmuebles.",
  },

  // Physical Products & Ecommerce
  {
    id: "fashion_apparel",
    name: "Moda, Ropa y Calzado",
    businessType: "ecommerce",
    description: "Prendas de vestir, calzado y confección textil.",
  },
  {
    id: "beauty_cosmetics",
    name: "Belleza, Cuidado Personal y Cosméticos",
    businessType: "ecommerce",
    description: "Skincare, maquillaje y productos capilares.",
  },
  {
    id: "electronics_gadgets",
    name: "Tecnología, Accesorios y Gadgets",
    businessType: "ecommerce",
    description: "Dispositivos electrónicos y complementos tecnológicos.",
  },
  {
    id: "home_decor",
    name: "Hogar, Muebles y Decoración",
    businessType: "ecommerce",
    description: "Artículos para el hogar y mobiliario.",
  },
  {
    id: "supplements_wellness",
    name: "Suplementos y Bienestar",
    businessType: "ecommerce",
    description: "Nutrición deportiva y suplementación diaria.",
  },
];

/**
 * Indicative and verified reference database.
 * Explicitly tracks source, date, confidence level, and country.
 * Fundamental rule: We do NOT present benchmarks as official Meta statistics.
 */
export const INITIAL_BENCHMARKS: BenchmarkRecord[] = [
  // Colombia - Services - Coaching / Mentoring
  {
    id: "bm-co-coach-cpm",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "cpm",
    value: 14500, // COP (~$3.5 USD)
    currency: "COP",
    sourceName: "Estudio Traffiker Digital Q1 2025 (Muestra agregada LATAM)",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-co-coach-ctr",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "ctr",
    value: 1.85,
    currency: "COP",
    sourceName: "Estudio Traffiker Digital Q1 2025 (Muestra agregada LATAM)",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-co-coach-cpc",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "cpc",
    value: 780, // COP
    currency: "COP",
    sourceName: "Estudio Traffiker Digital Q1 2025",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-co-coach-c2l",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "click_to_lead",
    value: 15.0,
    currency: "COP",
    sourceName: "Promedio de conversión en Landing Pages y Formularios optimizados",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-co-coach-l2q",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "lead_to_qualified",
    value: 45.0,
    currency: "COP",
    sourceName: "Promedios de calificación comercial Traffiker Digital",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-co-coach-q2c",
    countryCode: "CO",
    sectorId: "coaching_mentoring",
    objective: "leads",
    businessType: "services",
    metric: "qualified_to_client",
    value: 25.0,
    currency: "COP",
    sourceName: "Promedios de llamada de venta / WhatsApp",
    sourceDate: "2025-01-15",
    updatedAt: "2025-01-15",
    confidenceLevel: "indicative",
    isActive: true,
  },

  // Mexico - Ecommerce - Fashion
  {
    id: "bm-mx-fash-cpm",
    countryCode: "MX",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "cpm",
    value: 85.0, // MXN (~$4.3 USD)
    currency: "MXN",
    sourceName: "Muestra de campañas Ecommerce México Q1 2025",
    sourceDate: "2025-01-20",
    updatedAt: "2025-01-20",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-mx-fash-ctr",
    countryCode: "MX",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "ctr",
    value: 2.1,
    currency: "MXN",
    sourceName: "Muestra de campañas Ecommerce México Q1 2025",
    sourceDate: "2025-01-20",
    updatedAt: "2025-01-20",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-mx-fash-cpc",
    countryCode: "MX",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "cpc",
    value: 4.05,
    currency: "MXN",
    sourceName: "Muestra de campañas Ecommerce México Q1 2025",
    sourceDate: "2025-01-20",
    updatedAt: "2025-01-20",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-mx-fash-c2p",
    countryCode: "MX",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "click_to_purchase",
    value: 2.2,
    currency: "MXN",
    sourceName: "Muestra de campañas Ecommerce México Q1 2025",
    sourceDate: "2025-01-20",
    updatedAt: "2025-01-20",
    confidenceLevel: "indicative",
    isActive: true,
  },

  // US - Services - Professional
  {
    id: "bm-us-prof-cpm",
    countryCode: "US",
    sectorId: "professional_services",
    objective: "leads",
    businessType: "services",
    metric: "cpm",
    value: 24.5, // USD
    currency: "USD",
    sourceName: "Wordstream US Meta Ads Benchmarks Report 2024",
    sourceDate: "2024-11-10",
    updatedAt: "2025-01-10",
    confidenceLevel: "verified_sample",
    isActive: true,
  },
  {
    id: "bm-us-prof-ctr",
    countryCode: "US",
    sectorId: "professional_services",
    objective: "leads",
    businessType: "services",
    metric: "ctr",
    value: 1.45,
    currency: "USD",
    sourceName: "Wordstream US Meta Ads Benchmarks Report 2024",
    sourceDate: "2024-11-10",
    updatedAt: "2025-01-10",
    confidenceLevel: "verified_sample",
    isActive: true,
  },
  {
    id: "bm-us-prof-cpc",
    countryCode: "US",
    sectorId: "professional_services",
    objective: "leads",
    businessType: "services",
    metric: "cpc",
    value: 1.69,
    currency: "USD",
    sourceName: "Wordstream US Meta Ads Benchmarks Report 2024",
    sourceDate: "2024-11-10",
    updatedAt: "2025-01-10",
    confidenceLevel: "verified_sample",
    isActive: true,
  },
  {
    id: "bm-us-prof-c2l",
    countryCode: "US",
    sectorId: "professional_services",
    objective: "leads",
    businessType: "services",
    metric: "click_to_lead",
    value: 9.5,
    currency: "USD",
    sourceName: "Wordstream US Meta Ads Benchmarks Report 2024",
    sourceDate: "2024-11-10",
    updatedAt: "2025-01-10",
    confidenceLevel: "verified_sample",
    isActive: true,
  },

  // Spain - Ecommerce - General
  {
    id: "bm-es-ecom-cpm",
    countryCode: "ES",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "cpm",
    value: 8.8, // EUR (~$9.5 USD)
    currency: "EUR",
    sourceName: "Estudio Publicidad Digital España Q4 2024",
    sourceDate: "2024-12-15",
    updatedAt: "2025-01-10",
    confidenceLevel: "indicative",
    isActive: true,
  },
  {
    id: "bm-es-ecom-ctr",
    countryCode: "ES",
    sectorId: "fashion_apparel",
    objective: "ecommerce_sales",
    businessType: "ecommerce",
    metric: "ctr",
    value: 1.75,
    currency: "EUR",
    sourceName: "Estudio Publicidad Digital España Q4 2024",
    sourceDate: "2024-12-15",
    updatedAt: "2025-01-10",
    confidenceLevel: "indicative",
    isActive: true,
  },
];

/**
 * Relative CPM factors by country economic tier (in base USD)
 * Used strictly as illustrative modeling baselines when no verified local study is available.
 */
const COUNTRY_TIER_CPM_USD: Record<string, number> = {
  US: 22.0,
  ES: 9.5,
  MX: 4.8,
  CL: 5.2,
  BR: 4.5,
  UY: 5.0,
  CO: 3.5,
  AR: 2.8,
  PE: 3.6,
  CR: 4.2,
  PA: 4.0,
  DO: 3.5,
  EC: 3.2,
  GT: 3.0,
  SV: 2.8,
  HN: 2.6,
  NI: 2.4,
  PY: 2.7,
  BO: 2.5,
  VE: 2.2,
};

/**
 * Objective conversion modifiers to ensure funnels behave accurately:
 * E.g., WhatsApp campaigns have higher direct chat conversion than broad Traffic campaigns.
 */
interface ObjectiveModifiers {
  ctrMultiplier: number;
  clickToLead: number;
  leadToQualified: number;
  qualifiedToClient: number;
  clickToPurchase: number;
  advice: string;
}

function getObjectiveModifiers(
  objective: CampaignObjective,
  businessType: BusinessType
): ObjectiveModifiers {
  switch (objective) {
    case "whatsapp":
      return {
        ctrMultiplier: 1.15,
        clickToLead: 18.0, // High direct chat start rate
        leadToQualified: 38.0,
        qualifiedToClient: 22.0,
        clickToPurchase: 3.0,
        advice:
          "Las campañas a WhatsApp generan conversaciones directas más rápido, con mayor volumen inicial de contactos pero requiriendo filtro de calificación.",
      };
    case "messages":
      return {
        ctrMultiplier: 1.1,
        clickToLead: 15.0,
        leadToQualified: 35.0,
        qualifiedToClient: 20.0,
        clickToPurchase: 2.5,
        advice:
          "Las campañas de mensajes en Instagram o Messenger generan contacto ágil con respuesta inmediata del prospecto.",
      };
    case "leads":
      return {
        ctrMultiplier: 1.0,
        clickToLead: 11.0, // Landing page o formulario instantáneo
        leadToQualified: 45.0, // Mejor filtro inicial
        qualifiedToClient: 25.0,
        clickToPurchase: 2.0,
        advice:
          "Los formularios de clientes potenciales y landing pages filtran mejor a los interesados antes de contactarlos.",
      };
    case "traffic":
      return {
        ctrMultiplier: 1.35, // More clicks but lower intent
        clickToLead: 4.0, // Lower conversion rate to real leads
        leadToQualified: 25.0,
        qualifiedToClient: 15.0,
        clickToPurchase: 0.9,
        advice:
          "Atención: Las campañas de solo tráfico generan clics económicos, pero no están optimizadas por Meta para conseguir ventas o contactos de alta calidad.",
      };
    case "conversions":
    case "ecommerce_sales":
    default:
      return {
        ctrMultiplier: 1.0,
        clickToLead: 12.0,
        leadToQualified: 40.0,
        qualifiedToClient: 20.0,
        clickToPurchase: 2.2,
        advice:
          "Las campañas de conversión y ventas buscan usuarios con alta intención de compra o registro calificado.",
      };
  }
}

/**
 * Resolves default benchmark values for any combination of country, sector, business type, and campaign objective.
 * Never invents official data: if a verified record is absent, returns an illustrative baseline clearly identified.
 */
export function getBenchmarkDefaults(params: {
  countryCode: string;
  sectorId?: string;
  businessType: BusinessType;
  objective?: CampaignObjective;
  currencyCode: string;
  exchangeRateToUSD: number;
}): ResolvedBenchmarkPackage {
  const {
    countryCode,
    sectorId = "coaching_mentoring",
    businessType,
    objective = "leads",
    currencyCode,
    exchangeRateToUSD,
  } = params;

  // 1. Check for specific matching benchmark records in this country & objective
  const objectiveMods = getObjectiveModifiers(objective, businessType);

  const exactMatches = INITIAL_BENCHMARKS.filter(
    (b) =>
      b.countryCode === countryCode &&
      b.businessType === businessType &&
      b.objective === objective &&
      b.isActive
  );

  const countryMatches = INITIAL_BENCHMARKS.filter(
    (b) =>
      b.countryCode === countryCode &&
      b.businessType === businessType &&
      b.isActive
  );

  if (exactMatches.length > 0 || countryMatches.length > 0) {
    const pool = exactMatches.length > 0 ? exactMatches : countryMatches;

    const findMetric = (metricName: string, fallback: number): number => {
      const match = pool.find((b) => b.metric === metricName);
      if (!match) return fallback;
      if (match.currency === "USD" && currencyCode !== "USD") {
        return match.value * exchangeRateToUSD;
      }
      return match.value;
    };

    const firstMatch = pool[0];
    const cpm = findMetric("cpm", 15000);
    const ctr = findMetric("ctr", 1.85);
    const cpc =
      findMetric("cpc", 0) > 0
        ? findMetric("cpc", 0)
        : ctr > 0
        ? cpm / (1000 * (ctr / 100))
        : 0;

    // Funnel metrics: if exact objective match exists, use its value, otherwise use objective-adjusted modifiers
    const clickToLead = exactMatches.length > 0
      ? findMetric("click_to_lead", objectiveMods.clickToLead)
      : objectiveMods.clickToLead;

    const leadToQualified = exactMatches.length > 0
      ? findMetric("lead_to_qualified", objectiveMods.leadToQualified)
      : objectiveMods.leadToQualified;

    const qualifiedToClient = exactMatches.length > 0
      ? findMetric("qualified_to_client", objectiveMods.qualifiedToClient)
      : objectiveMods.qualifiedToClient;

    const clickToPurchase = exactMatches.length > 0
      ? findMetric("click_to_purchase", objectiveMods.clickToPurchase)
      : objectiveMods.clickToPurchase;

    return {
      cpm: Math.round(cpm * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      clickToLead,
      leadToQualified,
      qualifiedToClient,
      clickToPurchase,
      confidenceLevel: firstMatch.confidenceLevel,
      isIllustrative: firstMatch.confidenceLevel === "indicative",
      sourceNotice: `Referencia estimada para ${countryCode} basada en ${firstMatch.sourceName} (${firstMatch.sourceDate}).`,
      sourceDate: firstMatch.sourceDate,
    };
  }

  // 2. Fallback to illustrative modeled assumption
  const baseUsdCpm = COUNTRY_TIER_CPM_USD[countryCode] || 3.5;
  const localCpm = baseUsdCpm * (currencyCode === "USD" ? 1.0 : exchangeRateToUSD);
  const baseCtr = Number((1.75 * objectiveMods.ctrMultiplier).toFixed(2));
  const estimatedCpc =
    baseCtr > 0 ? localCpm / (1000 * (baseCtr / 100)) : 0;

  return {
    cpm: Math.max(0.1, Math.round(localCpm * 100) / 100),
    ctr: Math.max(0.1, baseCtr),
    cpc: Math.max(0.01, Math.round(estimatedCpc * 100) / 100),
    clickToLead: objectiveMods.clickToLead,
    leadToQualified: objectiveMods.leadToQualified,
    qualifiedToClient: objectiveMods.qualifiedToClient,
    clickToPurchase: objectiveMods.clickToPurchase,
    confidenceLevel: "illustrative_assumption",
    isIllustrative: true,
    sourceNotice: `Supuesto ilustrativo orientativo para ${countryCode} ajustado a tu objetivo publicitario. Puedes editar libremente cada valor.`,
    sourceDate: "2025-01-01",
  };
}
