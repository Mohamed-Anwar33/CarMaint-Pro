-- Add warranty months columns for brakes and coolant
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brakes_warranty_months INTEGER DEFAULT 6;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS coolant_warranty_months INTEGER DEFAULT 6;
