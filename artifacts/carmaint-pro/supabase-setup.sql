-- CarMaint Pro — Supabase Database Setup
-- Run this SQL in the Supabase Dashboard > SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('manager', 'driver', 'both', 'admin')),
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'family_small', 'family_large')),
  account_type TEXT NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'family', 'company')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Cars table
CREATE TABLE IF NOT EXISTS public.cars (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id               UUID REFERENCES public.profiles(id),
  name                    TEXT NOT NULL,
  model_year              INTEGER NOT NULL,
  transmission_type       TEXT NOT NULL DEFAULT 'automatic' CHECK (transmission_type IN ('automatic', 'manual')),
  engine_oil_type         TEXT NOT NULL DEFAULT '10000km' CHECK (engine_oil_type IN ('5000km', '10000km')),
  coolant_fill_date       DATE,
  coolant_next_alert_date DATE,
  registration_expiry     DATE,
  license_expiry          DATE,
  insurance_expiry        DATE,
  inspection_expiry       DATE,
  battery_install_date    DATE,
  battery_warranty_months INTEGER,
  tire_install_date       DATE,
  tire_warranty_months    INTEGER,
  last_mileage            INTEGER,
  next_oil_change_mileage INTEGER,
  driver_name             TEXT,
  invoices                TEXT[] DEFAULT '{}',
  battery_invoice         TEXT,
  tire_invoice            TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  image_url  TEXT,
  type       TEXT NOT NULL DEFAULT 'update' CHECK (type IN ('offer', 'update', 'tip')),
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Driver Reports table
CREATE TABLE IF NOT EXISTS public.driver_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id          UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  current_mileage INTEGER NOT NULL,
  oil_level       TEXT NOT NULL DEFAULT 'normal' CHECK (oil_level IN ('normal', 'low')),
  tires_status    TEXT NOT NULL DEFAULT 'green' CHECK (tires_status IN ('green', 'yellow', 'red')),
  brakes_status   TEXT NOT NULL DEFAULT 'green' CHECK (brakes_status IN ('green', 'yellow', 'red')),
  ac_status       TEXT NOT NULL DEFAULT 'green' CHECK (ac_status IN ('green', 'yellow', 'red')),
  notes           TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id         UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  invited_email  TEXT NOT NULL,
  invited_by     UUID NOT NULL REFERENCES public.profiles(id),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  token          TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Row Level Security (RLS) policies

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations   ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own; admins can read all
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Announcements: all authenticated users can read active ones; admin can manage
CREATE POLICY "announcements_read"   ON public.announcements FOR SELECT USING (active = TRUE OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "announcements_manage" ON public.announcements FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Cars: owners and assigned drivers can access their cars; admins can view all
CREATE POLICY "cars_owner_or_driver"  ON public.cars FOR SELECT USING (owner_id = auth.uid() OR driver_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "cars_owner_insert"     ON public.cars FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "cars_owner_update"     ON public.cars FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "cars_owner_delete"     ON public.cars FOR DELETE USING (owner_id = auth.uid());

-- Driver Reports: driver can insert; owner can read; admin can read all
CREATE POLICY "reports_driver_insert" ON public.driver_reports FOR INSERT WITH CHECK (driver_id = auth.uid());
CREATE POLICY "reports_read"          ON public.driver_reports FOR SELECT USING (
  driver_id = auth.uid() OR
  (SELECT owner_id FROM public.cars WHERE id = car_id) = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Invitations: invited user or car owner can see
CREATE POLICY "invitations_read"   ON public.invitations FOR SELECT USING (invited_by = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "invitations_insert" ON public.invitations FOR INSERT WITH CHECK (invited_by = auth.uid());

-- 8. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, plan, onboarding_completed, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager'),
    'free',
    FALSE,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Done! Tables, policies, and trigger have been created.

-- ─── Push Subscriptions (for web push notifications) ───────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL UNIQUE,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_own" ON public.push_subscriptions FOR ALL USING (user_id = auth.uid());

-- ─── Notification Log (for tracking sent notifications) ────────────
CREATE TABLE IF NOT EXISTS public.notification_log (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sent_at    TIMESTAMPTZ DEFAULT NOW(),
  channel    TEXT DEFAULT 'push',
  status     TEXT DEFAULT 'sent'
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_log_own" ON public.notification_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_log_insert" ON public.notification_log FOR INSERT WITH CHECK (TRUE);

-- ─── Storage Bucket (for invoices/receipts) ───────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Invoices Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'invoices' );
CREATE POLICY "Invoices Auth Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );
CREATE POLICY "Invoices Auth Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'invoices' AND auth.role() = 'authenticated' );
