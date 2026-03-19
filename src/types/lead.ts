// ============================================
// DAN'S LEADS TYPES
// Description: TypeScript types for secondary marketplace
// ============================================

export interface DansLead {
  id: string;
  admin_id: string | null;

  // Public info (visible to everyone)
  title: string;
  description: string;
  location: string;
  property_type: string | null;
  price: number;

  // Images (optional)
  media_urls: string[];
  thumbnail_url: string | null;

  // Private data (unlocked after purchase)
  full_details: LeadFullDetails;

  is_sold: boolean;

  created_at: string;
  updated_at: string;
}

export interface LeadFullDetails {
  seller_name: string;
  seller_phone: string;
  seller_email?: string;
  full_address?: string;
  additional_notes?: string;
  [key: string]: unknown;
}

export interface LeadPurchase {
  id: string;
  lead_id: string;
  buyer_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  created_at: string;

  // Joined data
  lead?: DansLead;
}

export interface CreateLeadInput {
  title: string;
  description: string;
  location: string;
  property_type?: string;
  price: number;
  media_urls?: string[];
  thumbnail_url?: string | null;
  full_details: LeadFullDetails;
}

export interface UpdateLeadInput {
  title?: string;
  description?: string;
  location?: string;
  property_type?: string;
  price?: number;
  media_urls?: string[];
  thumbnail_url?: string | null;
  full_details?: LeadFullDetails;
  is_sold?: boolean;
}

export interface LeadWithPurchaseStatus extends DansLead {
  is_purchased: boolean;
  purchase_date?: string;
}
