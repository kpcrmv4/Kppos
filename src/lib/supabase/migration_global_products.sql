-- =============================================
-- Migration: Add global_products table
-- Run this in Supabase SQL Editor for existing stores
-- =============================================

-- 1. Create global_products table (master product catalog)
CREATE TABLE IF NOT EXISTS global_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_products_store_id ON global_products(store_id);

-- 2. Add global_product_id to existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS global_product_id UUID REFERENCES global_products(id) ON DELETE SET NULL;

-- 3. Auto-update trigger for global_products
CREATE TRIGGER update_global_products_updated_at
  BEFORE UPDATE ON global_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS policy
ALTER TABLE global_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on global_products" ON global_products FOR ALL USING (true) WITH CHECK (true);
