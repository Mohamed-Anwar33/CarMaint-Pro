-- ============================================
-- CarMaint Pro - Payment System Tables
-- ============================================
-- Run this SQL in Supabase SQL Editor AFTER supabase-tables.sql
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('paid', 'refunded', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan user_plan NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  moyasar_payment_id TEXT,
  amount INTEGER NOT NULL, -- Amount in halalas (cents), e.g. 9900 = 99 SAR
  currency TEXT NOT NULL DEFAULT 'SAR',
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL, -- Amount in halalas
  currency TEXT NOT NULL DEFAULT 'SAR',
  plan user_plan NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  payment_method TEXT, -- mada, visa, mastercard, etc.
  moyasar_payment_id TEXT,
  -- Company details (for the invoice display)
  company_name TEXT DEFAULT 'مداري - Mdari',
  company_address TEXT DEFAULT 'المملكة العربية السعودية',
  vat_number TEXT,
  -- Status
  status invoice_status NOT NULL DEFAULT 'paid',
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- PAYMENT LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moyasar_payment_id TEXT,
  event_type TEXT NOT NULL, -- 'payment_initiated', 'payment_completed', 'payment_failed', 'verification_success', 'verification_failed'
  status TEXT,
  amount INTEGER,
  raw_response JSONB, -- Full Moyasar response for debugging
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_moyasar_id ON payment_logs(moyasar_payment_id);

-- ============================================
-- FUNCTION: Generate Invoice Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_str := to_char(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1 INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_str || '-%';
  
  invoice_num := 'INV-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Users can only see their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Users can only see their own payment logs
CREATE POLICY "Users can view own payment logs"
  ON payment_logs FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Service role (Edge Functions) can do everything
CREATE POLICY "Service role full access subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payment_logs"
  ON payment_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can view all
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::TEXT AND role = 'admin')
  );

CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::TEXT AND role = 'admin')
  );

SELECT 'تم إنشاء جداول نظام الدفع بنجاح! 💳✅' AS status;
