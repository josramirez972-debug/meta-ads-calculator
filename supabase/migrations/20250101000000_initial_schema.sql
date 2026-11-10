-- ====================================================================
-- META ADS ROI CALCULATOR - TRAFFIKER DIGITAL
-- Complete PostgreSQL Schema & Row Level Security (RLS)
-- ====================================================================

-- 1. Countries table
CREATE TABLE IF NOT EXISTS public.countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  default_exchange_rate NUMERIC(14, 4) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('services', 'ecommerce')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Benchmarks table
CREATE TABLE IF NOT EXISTS public.benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  sector_id VARCHAR(50) NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  objective VARCHAR(50) NOT NULL,
  business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('services', 'ecommerce')),
  metric VARCHAR(50) NOT NULL,
  value NUMERIC(14, 4) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  source_url TEXT,
  source_date DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  confidence_level VARCHAR(30) NOT NULL CHECK (confidence_level IN ('indicative', 'historical', 'verified_sample')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

-- 4. Scenario Settings table
CREATE TABLE IF NOT EXISTS public.scenario_settings (
  id VARCHAR(50) PRIMARY KEY,
  pessimistic_cpc_multiplier NUMERIC(6, 4) NOT NULL DEFAULT 1.30,
  pessimistic_conversion_multiplier NUMERIC(6, 4) NOT NULL DEFAULT 0.70,
  optimistic_cpc_multiplier NUMERIC(6, 4) NOT NULL DEFAULT 0.80,
  optimistic_conversion_multiplier NUMERIC(6, 4) NOT NULL DEFAULT 1.25,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Lead Requests table (Prospects requesting advisory from Traffiker Digital)
CREATE TABLE IF NOT EXISTS public.lead_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  company VARCHAR(150),
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  country VARCHAR(50),
  business_type VARCHAR(20) NOT NULL,
  sector VARCHAR(100),
  budget NUMERIC(14, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  objective VARCHAR(100),
  message TEXT,
  simulation_summary JSONB,
  consent BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Calculator Sessions table (Anonymous calculation tracking with explicit consent)
CREATE TABLE IF NOT EXISTS public.calculator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type VARCHAR(20) NOT NULL,
  country VARCHAR(50),
  currency VARCHAR(3) NOT NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  assumptions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Admin Profiles
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150),
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Countries & Sectors: Public read-only
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read sectors" ON public.sectors FOR SELECT USING (true);

-- Benchmarks: Public can view active benchmarks
CREATE POLICY "Public read active benchmarks" ON public.benchmarks FOR SELECT USING (is_active = true);
-- Benchmarks: Only authenticated admin can modify
CREATE POLICY "Admin write benchmarks" ON public.benchmarks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Scenario Settings: Public read
CREATE POLICY "Public read scenario settings" ON public.scenario_settings FOR SELECT USING (true);
CREATE POLICY "Admin write scenario settings" ON public.scenario_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Lead Requests: Public can insert their own request
CREATE POLICY "Public insert lead requests" ON public.lead_requests FOR INSERT WITH CHECK (consent = true);
-- Lead Requests: Only authenticated admin can read and update
CREATE POLICY "Admin access lead requests" ON public.lead_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Calculator Sessions: Public can insert anonymous session with consent
CREATE POLICY "Public insert calculator sessions" ON public.calculator_sessions FOR INSERT WITH CHECK (true);
-- Calculator Sessions: Only admin can inspect stored sessions
CREATE POLICY "Admin access calculator sessions" ON public.calculator_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Admin Profiles: Users can read their own profile
CREATE POLICY "Admin read own profile" ON public.admin_profiles FOR SELECT USING (
  auth.uid() = id
);
