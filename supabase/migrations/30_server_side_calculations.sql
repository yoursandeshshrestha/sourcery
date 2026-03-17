-- ============================================
-- SERVER-SIDE FINANCIAL CALCULATIONS
-- Migration: 30
-- Description: PostgreSQL function to calculate ROI, Yield, and ROCE
-- SECURITY: Prevents client-side manipulation of financial metrics
-- ============================================

-- Function to calculate financial metrics
-- This runs automatically on INSERT/UPDATE of deals table
CREATE OR REPLACE FUNCTION calculate_deal_metrics()
RETURNS TRIGGER AS $$
DECLARE
  purchase_price DECIMAL;
  refurb_costs DECIMAL;
  sourcing_fee DECIMAL;
  estimated_profit DECIMAL;
  monthly_rent DECIMAL;
  total_investment DECIMAL;
  annual_rent DECIMAL;
BEGIN
  -- Extract values from JSONB financial_metrics
  purchase_price := COALESCE((NEW.financial_metrics->>'purchase_price')::DECIMAL, 0);
  refurb_costs := COALESCE((NEW.financial_metrics->>'refurb_costs')::DECIMAL, 0);
  estimated_profit := COALESCE((NEW.financial_metrics->>'estimated_profit')::DECIMAL, 0);
  monthly_rent := COALESCE((NEW.financial_metrics->>'estimated_rental_income')::DECIMAL, 0);
  sourcing_fee := COALESCE(NEW.sourcing_fee, 0);

  -- Calculate total investment
  total_investment := purchase_price + refurb_costs + sourcing_fee;

  -- Calculate ROI (Return on Investment)
  -- Formula: (Estimated Profit / Total Investment) * 100
  IF total_investment > 0 AND estimated_profit > 0 THEN
    NEW.calculated_roi := ROUND((estimated_profit / total_investment) * 100, 2);
  ELSE
    NEW.calculated_roi := NULL;
  END IF;

  -- Calculate Yield (Rental Yield)
  -- Formula: (Annual Rental Income / Purchase Price) * 100
  IF purchase_price > 0 AND monthly_rent > 0 THEN
    annual_rent := monthly_rent * 12;
    NEW.calculated_yield := ROUND((annual_rent / purchase_price) * 100, 2);
  ELSE
    NEW.calculated_yield := NULL;
  END IF;

  -- Calculate ROCE (Return on Capital Employed)
  -- Formula: (Annual Net Rental Income / Total Investment) * 100
  IF total_investment > 0 AND monthly_rent > 0 THEN
    annual_rent := monthly_rent * 12;
    NEW.calculated_roce := ROUND((annual_rent / total_investment) * 100, 2);
  ELSE
    NEW.calculated_roce := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before INSERT or UPDATE
-- This ensures all calculations happen server-side
DROP TRIGGER IF EXISTS trigger_calculate_deal_metrics ON deals;

CREATE TRIGGER trigger_calculate_deal_metrics
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_deal_metrics();

-- Add comment for documentation
COMMENT ON FUNCTION calculate_deal_metrics() IS
  'Server-side calculation of ROI, Yield, and ROCE to prevent client manipulation.
   Automatically runs on INSERT/UPDATE of deals table.';
