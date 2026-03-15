-- ============================================
-- CarMaint Pro - Supabase Database Setup
-- ============================================
-- Run this SQL in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lmkutuybfpglfkfxiwns/sql/new
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('manager', 'driver', 'both', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_plan AS ENUM ('free', 'pro', 'family_small', 'family_large');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE engine_oil_type AS ENUM ('5000km', '10000km', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_type AS ENUM ('offer', 'update');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE oil_level AS ENUM ('normal', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE health_status AS ENUM ('green', 'yellow', 'red');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('individual', 'family', 'company');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- TABLES
-- ============================================

-- Users (synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'manager',
  plan user_plan NOT NULL DEFAULT 'free',
  account_type account_type NOT NULL DEFAULT 'individual',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cars
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  model_year INTEGER NOT NULL,
  transmission_type transmission_type NOT NULL,
  engine_oil_type TEXT NOT NULL DEFAULT '10000km',
  engine_oil_custom_days INTEGER,
  engine_oil_custom_km INTEGER,
  coolant_fill_date TEXT,
  coolant_next_alert_date TEXT,
  registration_expiry TEXT,
  license_expiry TEXT,
  insurance_expiry TEXT,
  inspection_expiry TEXT,
  battery_install_date TEXT,
  battery_warranty_months INTEGER,
  battery_brand TEXT,
  battery_invoice TEXT,
  tire_install_date TEXT,
  tire_warranty_months INTEGER,
  tire_size TEXT,
  tire_invoice TEXT,
  brakes_install_date TEXT,
  last_mileage INTEGER,
  next_oil_change_mileage INTEGER,
  next_air_filter_mileage INTEGER,
  last_report_date TIMESTAMP WITH TIME ZONE,
  plate_number TEXT,
  notes TEXT,
  driver_name TEXT,
  invoices TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type announcement_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Driver Reports
CREATE TABLE IF NOT EXISTS driver_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_mileage INTEGER NOT NULL,
  oil_level oil_level NOT NULL,
  tires_status health_status NOT NULL,
  brakes_status health_status NOT NULL,
  ac_status health_status NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invitations (for driver/family member invites)
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  driver_email TEXT NOT NULL,
  manager_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(car_id, driver_email)
);

-- Push Subscriptions (for notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Log
CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'push',
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cars_owner_id ON cars(owner_id);
CREATE INDEX IF NOT EXISTS idx_cars_driver_id ON cars(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_reports_car_id ON driver_reports(car_id);
CREATE INDEX IF NOT EXISTS idx_driver_reports_driver_id ON driver_reports(driver_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active);
CREATE INDEX IF NOT EXISTS idx_invitations_manager_id ON invitations(manager_id);
CREATE INDEX IF NOT EXISTS idx_invitations_car_id ON invitations(car_id);

SELECT 'تم إنشاء جداول قاعدة البيانات بنجاح! ✅' AS status;
