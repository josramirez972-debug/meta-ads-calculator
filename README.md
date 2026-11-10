# 🚀 META ADS ROI CALCULATOR — TRAFFIKER DIGITAL

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-48%2F48_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Live_Demo-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://calculadoraads.pages.dev)

> **Aplicación web de planificación financiera y simulación de rentabilidad para campañas en Facebook e Instagram (Meta Ads)**, desarrollada para **Traffiker Digital**. Diseñada bajo el principio de que *el emprendedor introduce los datos que conoce de su negocio y el motor matemático calcula automáticamente lo que desconoce*.

🌐 **Demo en Producción (Live):** **[https://calculadoraads.pages.dev](https://calculadoraads.pages.dev)**

---

## 🎯 Problema que Resuelve

 Muchos anunciantes, comercios electrónicos y negocios de servicios invierten en publicidad digital confundiendo **facturación bruta (ROAS)** con **ganancia real (ROI)**, o interpretan el presupuesto publicitario como un gasto perdido al no visualizar cómo se recupera a través de las ventas.

**Meta Ads ROI Calculator** soluciona esto mediante un **Wizard interactivo de 7 pasos** y un **motor financiero determinístico** que separa claramente:
1. **Nivel 1 — Margen disponible por venta:** Lo que queda de cada venta tras descontar el costo directo de entrega y costos variables unitarios.
2. **Nivel 2 — Beneficio después de publicidad:** El margen total acumulado menos el presupuesto pagado directamente a Meta Ads.
3. **Nivel 3 — Ganancia neta del negocio:** El dinero libre final tras cubrir también los gastos fijos mensuales (honorarios de agencia/traffiker, herramientas y costos operativos).

---

## ✨ Características Principales

- **🧭 Experiencia Guiada en 7 Pasos (UX Simplificada):**
  1. **Tu negocio:** Selección entre *Servicios / Atención comercial* y *Ecommerce / Tienda online*, país, sector, moneda y canal de conversión (WhatsApp, Instagram DM, Formularios, Landing Page, Llamadas o Checkout).
  2. **Cuánto ganas por venta:** Cálculo en vivo del margen unitario antes de publicidad con diagnóstico automático (*Positivo, Ajustado, Cero o Negativo*) y configuración avanzada opcional de recompra (**LTV**).
  3. **Tus gastos mensuales:** Separación estricta de costos fijos mensuales (gestión publicitaria, herramientas digitales y gastos personalizados).
  4. **Tu objetivo comercial:** Metas por **Ganancia neta**, **Facturación total**, **Número de clientes** o **Número de ventas**.
  5. **Tu presupuesto publicitario:** Tres modalidades de cálculo:
     - *Modalidad A:* Presupuesto definido por el usuario.
     - *Modalidad B:* **Presupuesto Inverso** (despeja matemáticamente cuánto invertir para lograr la meta comercial).
     - *Modalidad C:* **Recomendador Inteligente** con 3 planes dinámicos (*Conservador*, *Recomendado* y *Acelerado*).
  6. **Estimación de resultados:** Modalidad *Principiante* (con benchmarks automáticos por país e industria) y *Avanzada* (para usuarios con métricas propias de `CPM`, `CTR` o `CPC`), incluyendo glosario interactivo.
  7. **Resultados y rentabilidad (Dashboard):** Visualización tipo **Cascada Financiera (Waterfall)** (*"¿Qué pasa con tu dinero?"*), desglose de los 3 niveles de rentabilidad, gráficos comparativos de sensibilidad con `Recharts` y exportación a **CSV / PDF**.

- **🧮 Ingeniería Financiera sin Redondeo Prematuro:**
  - Cálculos internos en coma flotante limpia (`cleanFloat` a precisión `1e-8`) para eliminar desfases entre el cálculo inverso y el estado de resultados final, redondeando personas/pedidos únicamente en la capa visual.
  - Protección contra metas matemáticamente inviables (`CPA estimado >= Margen por venta`), evitando recomendar presupuestos ficticios cuando el embudo genera pérdida unitaria.

- **🌍 Soporte Multipaís y Multimoneda:**
  - Más de 15 mercados configurados (Colombia, México, Estados Unidos, España, Argentina, Chile, Perú, Ecuador, etc.) con formateo regional `Intl.NumberFormat` y conversión dinámica de divisas.

---

## 🏗️ Arquitectura del Proyecto

El código aplica **Separación de Responsabilidades (Separation of Concerns)** desacoplando por completo el motor matemático (`lib/calculator/`) de los componentes de interfaz (`components/`):

```text
├── app/
│   ├── page.tsx                        # Punto de entrada principal
│   ├── admin/page.tsx                  # Panel administrativo de leads y benchmarks
│   ├── privacy/page.tsx                # Metodología financiera y política de datos
│   ├── layout.tsx                      # Layout global con Header Off-Canvas y Footer
│   └── globals.css                     # Estilos globales, tema oscuro y reglas @media print
├── components/
│   ├── calculator/
│   │   ├── CalculatorWizard.tsx        # Orquestador de estado de los 7 pasos
│   │   ├── StepBusiness.tsx            # Paso 1: Modelo de negocio, país, moneda y canal
│   │   ├── StepEconomics.tsx           # Paso 2: Economía unitaria y LTV opcional
│   │   ├── StepMonthlyExpenses.tsx     # Paso 3: Gastos fijos mensuales
│   │   ├── StepObjective.tsx           # Paso 4: Objetivo comercial y plazo
│   │   ├── StepBudget.tsx              # Paso 5: Presupuesto directo, inverso y recomendado
│   │   └── StepMetrics.tsx             # Paso 6: Benchmarks automáticos vs métricas reales
│   ├── results/
│   │   └── Dashboard.tsx               # Paso 7: Cascada financiera, 3 niveles, Recharts y exportación
│   ├── forms/
│   │   └── LeadAdvisoryModal.tsx       # Modal de solicitud de asesoría con validación
│   └── layout/
│       ├── Header.tsx                  # Navegación responsive con menú móvil Off-Canvas
│       └── Footer.tsx                  # Pie de página corporativo
├── lib/
│   ├── calculator/                     # Motor financiero puro en TypeScript (0 dependencias de UI)
│   │   ├── index.ts                    # Pipeline principal calculateFullRoi() y alertas
│   │   ├── advertising.ts              # Cálculo de CPM, CTR, CPC, impresiones y clics
│   │   ├── funnel.ts                   # Embudos de conversión (Servicios vs Ecommerce)
│   │   ├── economics.ts                # 3 Niveles de rentabilidad y separación de LTV
│   │   ├── inverse-budget.ts           # Resolución analítica de presupuesto inverso
│   │   ├── recommendation.ts           # Generador de escenarios Conservador/Recomendado/Acelerado
│   │   ├── profitability.ts            # Cálculo de ROAS, ROI Publicitario y ROI Total
│   │   ├── breakeven.ts                # Punto de equilibrio (CPA, CPL y CPC máximos)
│   │   ├── scenarios.ts                # Simulación Pesimista, Realista y Optimista
│   │   └── validation.ts               # Esquemas de validación con Zod
│   ├── benchmarks/                     # Benchmarks orientativos por país, sector y objetivo
│   ├── currency/                       # Catálogo de países, monedas y tasas de cambio
│   ├── reports/                        # Exportación a CSV y resumen de portapapeles
│   └── supabase/                       # Cliente Supabase con fallback automático en localStorage
├── types/
│   ├── calculator.ts                   # Interfaces estrictas del dominio financiero
│   ├── benchmarks.ts                   # Tipos de benchmarks y multiplicadores de escenarios
│   └── business.ts                     # Tipos de modelos de negocio y sectores
└── __tests__/
    └── calculator.test.ts              # 48 pruebas unitarias e integrales con Vitest
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Uso en el Proyecto |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Renderizado híbrido y exportación estática optimizada (`output: "export"`). |
| **Librería UI** | **React 19** | Componentes funcionales, gestión de estado del Wizard y Hooks (`useMemo`, `useState`). |
| **Lenguaje** | **TypeScript 5** | Tipado estático estricto en todo el motor financiero y props de componentes. |
| **Estilos** | **Tailwind CSS 3.4** | Diseño *Mobile-First*, menú *Off-Canvas* e identidad visual (`#0D0F12`, `#191C21`, `#FF5A1F`). |
| **Gráficos** | **Recharts** | Visualización interactiva de escenarios de sensibilidad. |
| **Validación** | **Zod** | Validación y sanitización de datos de entrada. |
| **Testing** | **Vitest** | Suite de **48 pruebas automatizadas** para garantizar precisión matemática. |
| **Base de Datos** | **Supabase (PostgreSQL)** | Almacenamiento de prospectos y calibración de benchmarks (con fallback local). |
| **Despliegue** | **Cloudflare Pages** | Hosting en el Edge global mediante `Wrangler CLI`. |

---

## ⚡ Instalación y Uso Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/josramirez972-debug/meta-ads-calculator.git
cd meta-ads-calculator
npm install
```

### 2. Ejecutar la suite de pruebas automatizadas (48 tests)
```bash
npm test
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3005](http://localhost:3005) en tu navegador.

### 4. Compilar y desplegar a producción
```bash
npm run build
npm run deploy
```

---

## 🧪 Caso de Prueba de Referencia (Validación Matemática)

El motor incluye una prueba integral verificada para un negocio de servicios en Colombia (`COP`):
- **Precio del servicio:** `$99.000 COP` | **Costo de entrega:** `$35.000 COP` → **Margen disponible (Nivel 1):** `$64.000 COP`
- **Gastos mensuales fijos:** `$250.000 COP` (gestión) + `$9.000 COP` (herramientas) = `$259.000 COP`
- **Meta comercial:** Ganancia neta libre de **`$3.000.000 COP`** en **`30 días`** (`CPA estimado = $46.446,45 COP`)
- **Resolución exacta del motor:**
  - **Clientes necesarios:** `185,66` (`186` en visualización)
  - **Ingresos por ventas (Facturación):** `$18.380.381 COP`
  - **Costos de entrega:** `-$6.498.115 COP`
  - **Presupuesto total para Meta Ads:** `-$8.623.266 COP` (`$287.442 COP / día`)
  - **Beneficio después de publicidad (Nivel 2):** `$3.259.000 COP`
  - **Gastos mensuales:** `-$259.000 COP`
  - **Ganancia neta proyectada (Nivel 3):** **`$3.000.000 COP`** *(Cuadre matemático exacto)*

---

## 📄 Licencia y Créditos

Desarrollado para **Traffiker Digital**.
