-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE announcement_type AS ENUM ('offer', 'update');
CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
CREATE TYPE engine_oil_type AS ENUM ('5000km', '10000km');
CREATE TYPE oil_level AS ENUM ('normal', 'low');
CREATE TYPE health_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE user_role AS ENUM ('manager', 'driver', 'both', 'admin');
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'family_small', 'family_large');

-- Create Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'manager',
  plan user_plan NOT NULL DEFAULT 'free',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Announcements Table
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type announcement_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Cars Table
CREATE TABLE cars (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  driver_id TEXT,
  name TEXT NOT NULL,
  model_year INTEGER NOT NULL,
  transmission_type transmission_type NOT NULL,
  engine_oil_type engine_oil_type NOT NULL,
  coolant_fill_date TEXT,
  coolant_next_alert_date TEXT,
  registration_expiry TEXT,
  license_expiry TEXT,
  insurance_expiry TEXT,
  inspection_expiry TEXT,
  battery_install_date TEXT,
  battery_warranty_months INTEGER,
  tire_install_date TEXT,
  tire_warranty_months INTEGER,
  last_mileage INTEGER,
  next_oil_change_mileage INTEGER,
  driver_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Driver Reports Table
CREATE TABLE driver_reports (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  current_mileage INTEGER NOT NULL,
  oil_level oil_level NOT NULL,
  tires_status health_status NOT NULL,
  brakes_status health_status NOT NULL,
  ac_status health_status NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
