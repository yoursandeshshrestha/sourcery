export type PipelineStage =
  | 'RESERVED'
  | 'LEGALS_INSTRUCTED'
  | 'VALUATION'
  | 'MORTGAGE_OFFER'
  | 'EXCHANGE'
  | 'COMPLETION';

export interface StageHistoryEntry {
  stage: PipelineStage;
  timestamp: string;
  changed_by: string;
}

export interface ProgressionPipeline {
  id: string;
  reservation_id: string;
  current_stage: PipelineStage;
  notes: string | null;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  stage_history: StageHistoryEntry[];
  created_at: string;
  updated_at: string;

  // Joined data
  reservation?: {
    id: string;
    deal_id: string;
    investor_id: string;
    sourcer_id: string;
    reservation_fee_amount: number;
    reservation_fee_paid: boolean;
    status: string;
    deal?: {
      headline: string;
      approximate_location: string;
      strategy_type: string;
      thumbnail_url: string | null;
      capital_required: number;
    };
    investor?: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
    sourcer?: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
}

export interface UpdatePipelineStageInput {
  id: string;
  current_stage: PipelineStage;
  notes?: string;
}

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  RESERVED: 'Reserved',
  LEGALS_INSTRUCTED: 'Legals Instructed',
  VALUATION: 'Valuation',
  MORTGAGE_OFFER: 'Mortgage Offer',
  EXCHANGE: 'Exchange',
  COMPLETION: 'Completion',
};

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  RESERVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  LEGALS_INSTRUCTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  VALUATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  MORTGAGE_OFFER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  EXCHANGE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  COMPLETION: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
};

export const PIPELINE_STAGES: PipelineStage[] = [
  'RESERVED',
  'LEGALS_INSTRUCTED',
  'VALUATION',
  'MORTGAGE_OFFER',
  'EXCHANGE',
  'COMPLETION',
];
