-- ============================================
-- CarMaint Pro - Migration: Add Missing Columns
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- This migration adds all columns that the frontend code expects
-- ============================================

-- 1. Add account_type to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'individual';

-- 2. Add missing columns to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS battery_brand TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS tire_size TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS plate_number TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS last_report_date TIMESTAMPTZ;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_oil_custom_days INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_oil_custom_km INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brakes_install_date TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS next_air_filter_mileage INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS battery_invoice TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS tire_invoice TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS invoices TEXT[] DEFAULT '{}';

-- 3. Fix engine_oil_type to support 'custom' (change from ENUM to TEXT if needed)
-- If engine_oil_type is an ENUM, we need to add 'custom' to it
-- Safest approach: alter the column to TEXT if it's currently an ENUM
DO $$ BEGIN
  ALTER TABLE cars ALTER COLUMN engine_oil_type TYPE TEXT;
EXCEPTION WHEN others THEN NULL; END $$;

-- 4. Create invitations table (if not exists)
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  driver_email TEXT NOT NULL,
  manager_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(car_id, driver_email)
);

-- 5. Add indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_manager_id ON invitations(manager_id);
CREATE INDEX IF NOT EXISTS idx_invitations_car_id ON invitations(car_id);

SELECT 'تم تحديث قاعدة البيانات بنجاح! ✅' AS status;
