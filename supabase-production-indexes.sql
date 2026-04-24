-- Production hardening: indexes + uniqueness guards
-- Run in Supabase SQL Editor after schema creation.

-- Prevent duplicate properties by name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_unique_name'
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_unique_name UNIQUE ("اسم_العقار");
  END IF;
END $$;

-- Prevent duplicate unit number under same property
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'units_unique_property_unit'
  ) THEN
    ALTER TABLE units
      ADD CONSTRAINT units_unique_property_unit UNIQUE ("اسم_العقار", "رقم_الوحدة");
  END IF;
END $$;

-- Common query indexes
CREATE INDEX IF NOT EXISTS idx_properties_name ON properties ("اسم_العقار");
CREATE INDEX IF NOT EXISTS idx_units_property_name ON units ("اسم_العقار");
CREATE INDEX IF NOT EXISTS idx_leases_contract_no ON leases ("رقم_العقد");
CREATE INDEX IF NOT EXISTS idx_leases_tenant_name ON leases ("اسم_المستأجر");
CREATE INDEX IF NOT EXISTS idx_payments_contract_no ON payments ("رقم_العقد");
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments ("تاريخ_الدفع");
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments ("تاريخ_استحقاق_القسط");

-- Keep created_date present for sorting
CREATE INDEX IF NOT EXISTS idx_properties_created_date ON properties (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_units_created_date ON units (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_leases_created_date ON leases (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_created_date ON payments (created_date DESC);
