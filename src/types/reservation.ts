export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  deal_id: string;
  investor_id: string;
  sourcer_id: string;

  status: ReservationStatus;

  reservation_fee_amount: number;
  reservation_fee_paid: boolean;
  payment_intent_id: string | null;

  investor_notes: string | null;
  sourcer_notes: string | null;

  reserved_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  updated_at: string;

  // Joined data
  deal?: {
    headline: string;
    approximate_location: string;
    strategy_type: string;
    thumbnail_url: string | null;
  };
  investor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    company_name: string | null;
  };
  sourcer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export interface CreateReservationInput {
  deal_id: string;
  investor_id: string;
  sourcer_id: string;
  reservation_fee_amount: number;
  investor_notes?: string;
  status?: ReservationStatus;
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};
