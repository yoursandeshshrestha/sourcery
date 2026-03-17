export type DealStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export type StrategyType = 'FLIP' | 'HMO' | 'R2R' | 'BTL' | 'BRRR';

export interface FinancialMetrics {
  purchase_price: number;
  refurb_costs?: number;
  total_investment: number;
  estimated_gdv?: number;
  estimated_rental_income?: number;
  estimated_profit?: number;
  roi_percentage?: number;
}

export interface Deal {
  id: string;
  sourcer_id: string;
  status: DealStatus;

  // Public metadata
  headline: string;
  description: string | null;
  strategy_type: StrategyType;
  approximate_location: string;
  capital_required: number;

  // Calculated metrics
  calculated_roi: number | null;
  calculated_yield: number | null;
  calculated_roce: number | null;

  // Private data (RLS protected)
  full_address: string;
  vendor_details: Record<string, unknown> | null;
  legal_pack_url: string | null;

  // Financial metrics
  financial_metrics: FinancialMetrics;

  // Media
  media_urls: string[] | null;
  thumbnail_url: string | null;

  // Fees
  reservation_fee: number;
  sourcing_fee: number;

  // Metadata
  view_count: number;
  created_at: string;
  updated_at: string;

  // Joined data
  sourcer?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export interface CreateDealInput {
  headline: string;
  description: string;
  strategy_type: StrategyType;
  approximate_location: string;
  capital_required: number;

  full_address: string;
  vendor_details?: Record<string, unknown>;
  legal_pack_url?: string;

  financial_metrics: FinancialMetrics;

  media_urls?: string[];
  thumbnail_url?: string;

  reservation_fee?: number;
  sourcing_fee: number;

  status?: DealStatus;
}

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  FLIP: 'Flip',
  HMO: 'HMO',
  R2R: 'Rent-to-Rent',
  BTL: 'Buy-to-Let',
  BRRR: 'BRRR',
};

export const STRATEGY_DESCRIPTIONS: Record<StrategyType, string> = {
  FLIP: 'Buy, renovate, and sell for profit',
  HMO: 'House in Multiple Occupation - rental income from multiple tenants',
  R2R: 'Rent-to-Rent - subletting for profit',
  BTL: 'Buy-to-Let - traditional landlord model',
  BRRR: 'Buy, Refurbish, Rent, Refinance - recycle capital',
};

export const STATUS_LABELS: Record<DealStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  RESERVED: 'Reserved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
