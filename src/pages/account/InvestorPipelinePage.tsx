import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MapPin, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { getPublicUrl } from '@/lib/storage';

interface PipelineStage {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

interface DealInPipeline {
  id: string;
  current_stage: string;
  deal: {
    headline: string;
    approximate_location: string;
    strategy_type: string;
    thumbnail_url?: string;
    capital_required: number;
  };
  reservation: {
    reservation_fee_amount: number;
    reserved_at: string;
  };
  sourcer: {
    first_name: string;
    last_name: string;
    company_name?: string;
  };
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'RESERVED', label: 'Reserved', color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'LEGALS_INSTRUCTED', label: 'Legals', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'VALUATION', label: 'Valuation', color: '#ec4899', bgColor: '#fdf2f8' },
  { id: 'MORTGAGE_OFFER', label: 'Mortgage', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'EXCHANGE', label: 'Exchange', color: '#10b981', bgColor: '#f0fdf4' },
  { id: 'COMPLETION', label: 'Completion', color: '#059669', bgColor: '#ecfdf5' },
];

const STRATEGY_LABELS: Record<string, string> = {
  FLIP: 'Flip',
  HMO: 'HMO',
  R2R: 'Rent2Rent',
  BTL: 'Buy-to-Let',
  BRRR: 'BRRR',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Draggable Deal Card Component
function DraggableDealCard({ deal }: { deal: DealInPipeline }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border-2 border-[#E9E6DF] rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Deal Thumbnail */}
      {deal.deal.thumbnail_url ? (
        <div className="w-full h-40 overflow-hidden relative">
          <img
            src={deal.deal.thumbnail_url}
            alt={deal.deal.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Strategy Badge on Image */}
          {deal.deal.strategy_type && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-[#1A1A1A] shadow-lg">
                {STRATEGY_LABELS[deal.deal.strategy_type] || deal.deal.strategy_type}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#F9F7F4] to-[#E9E6DF] flex items-center justify-center">
          <Building2 className="h-16 w-16 text-[#C5C0B8]" />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        {/* Deal Title */}
        <h4 className="font-bold text-base text-[#1A1A1A] mb-3 line-clamp-2 leading-tight min-h-[3rem]">
          {deal.deal.headline}
        </h4>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3 pb-3 border-b border-[#E9E6DF]">
          <MapPin className="h-4 w-4 text-[#1287ff] shrink-0 mt-0.5" />
          <span className="text-sm text-[#6B6B6B] line-clamp-2 leading-snug">
            {deal.deal.approximate_location}
          </span>
        </div>

        {/* Sourcer Info */}
        <div className="bg-[#F9F7F4] rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#1287ff] flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#6B6B6B] mb-0.5">Sourcer</p>
              <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                {deal.sourcer.first_name} {deal.sourcer.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Reservation Fee - Highlighted */}
        <div className="bg-gradient-to-r from-[#1287ff]/10 to-[#1287ff]/5 rounded-lg p-3 border border-[#1287ff]/20">
          <p className="text-xs font-medium text-[#1287ff] mb-1">Reservation Fee</p>
          <p className="font-bold text-xl text-[#1287ff]">
            {formatCurrency(deal.reservation.reservation_fee_amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Droppable Stage Column Component
function DroppableStageColumn({ stage, deals }: { stage: PipelineStage; deals: DealInPipeline[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="shrink-0 w-[340px]">
      {/* Stage Header */}
      <div className="mb-4">
        <div
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: stage.bgColor, color: stage.color }}
        >
          {stage.label}
        </div>
        <span className="ml-2 text-sm font-medium text-[#6B6B6B]">
          {deals.length}
        </span>
      </div>

      {/* Stage Content - Droppable Area */}
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] p-3 rounded-xl border-2 border-dashed transition-colors ${
          isOver
            ? 'border-[#1287ff] bg-[#1287ff]/5'
            : 'border-[#E9E6DF]'
        }`}
      >
        {deals.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#C5C0B8]">
            Drop deals here
          </div>
        ) : (
          deals.map((deal) => <DraggableDealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  );
}

export default function InvestorPipelinePage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<DealInPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<DealInPipeline | null>(null);
  const [updating, setUpdating] = useState(false);
  const lastUpdateRef = useRef<{ id: string; timestamp: number } | null>(null);

  useEffect(() => {
    fetchInvestorPipeline();

    // Set up realtime subscription
    const channel = supabase
      .channel('investor-pipeline-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progression_pipeline',
        },
        (payload) => {
          // Check if this update is from the current user (within 2 seconds)
          const isCurrentUserUpdate = lastUpdateRef.current &&
            payload.eventType === 'UPDATE' &&
            payload.new &&
            (payload.new as any).id === lastUpdateRef.current.id &&
            Date.now() - lastUpdateRef.current.timestamp < 2000;

          // Only refetch if update is from another user
          if (!isCurrentUserUpdate) {
            fetchInvestorPipeline();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInvestorPipeline = async () => {
    try {
      setLoading(true);

      // First, get investor's confirmed reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          id,
          deal_id,
          sourcer_id,
          reservation_fee_amount,
          reserved_at,
          status,
          deals (
            headline,
            approximate_location,
            strategy_type,
            thumbnail_url,
            capital_required
          ),
          sourcer:profiles!reservations_sourcer_id_fkey(
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('investor_id', user?.id)
        .eq('status', 'CONFIRMED');

      if (reservationsError) throw reservationsError;
      if (!reservationsData || reservationsData.length === 0) {
        setDeals([]);
        return;
      }

      // Get reservation IDs
      const reservationIds = reservationsData.map((r) => r.id);

      // Fetch pipelines for these reservations
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('progression_pipeline')
        .select('*')
        .in('reservation_id', reservationIds);

      if (pipelineError) throw pipelineError;

      // Combine data
      const transformedData = pipelineData.map((pipeline) => {
        const reservation = reservationsData.find((r) => r.id === pipeline.reservation_id);
        const dealData = reservation?.deals || {};

        // Convert storage path to public URL if thumbnail_url exists
        let thumbnailUrl = dealData.thumbnail_url;
        if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
          thumbnailUrl = getPublicUrl('deal-images', thumbnailUrl);
        }

        return {
          id: pipeline.id,
          current_stage: pipeline.current_stage,
          deal: { ...dealData, thumbnail_url: thumbnailUrl },
          reservation: {
            reservation_fee_amount: reservation?.reservation_fee_amount || 0,
            reserved_at: reservation?.reserved_at || '',
          },
          sourcer: reservation?.sourcer || {},
        };
      });

      setDeals(transformedData as DealInPipeline[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching investor pipeline:', error);
      }
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.current_stage === stageId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveDeal(null);
      return;
    }

    const dealId = active.id as string;
    const newStage = over.id as string;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, current_stage: newStage } : d
      )
    );
    setActiveDeal(null);

    try {
      setUpdating(true);

      // Track this update to prevent refetching on realtime event
      lastUpdateRef.current = { id: dealId, timestamp: Date.now() };

      const { error } = await supabase
        .from('progression_pipeline')
        .update({ current_stage: newStage })
        .eq('id', dealId);

      if (error) throw error;

      const stageLabel = PIPELINE_STAGES.find(s => s.id === newStage)?.label || newStage;
      toast.success(`Deal moved to ${stageLabel}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating pipeline stage:', error);
      }
      toast.error('Failed to update deal stage');
      // Revert optimistic update
      fetchInvestorPipeline();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1287ff]" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Investment Pipeline</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Track the progress of your property investments through each stage
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-[#E9E6DF] rounded-2xl bg-white">
          <Building2 className="h-16 w-16 text-[#C5C0B8] mb-4" />
          <p className="text-xl font-semibold mb-2 text-[#1A1A1A]">No deals in pipeline</p>
          <p className="text-[#6B6B6B] mb-6">
            Your confirmed reservations will appear here to track their progress
          </p>
          <button
            onClick={() => window.location.href = '/deals'}
            className="px-6 py-3 bg-[#1287ff] text-white rounded-xl font-semibold hover:bg-[#0A6FE6] transition-colors cursor-pointer"
          >
            Browse Deals
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#E9E6DF] rounded-2xl p-5">
              <p className="text-sm text-[#6B6B6B] mb-1">Active Investments</p>
              <p className="text-3xl font-bold text-[#1A1A1A]">{deals.length}</p>
            </div>
            <div className="bg-white border border-[#E9E6DF] rounded-2xl p-5">
              <p className="text-sm text-[#6B6B6B] mb-1">Total Invested</p>
              <p className="text-3xl font-bold text-[#1287ff]">
                {formatCurrency(deals.reduce((sum, d) => sum + d.reservation.reservation_fee_amount, 0))}
              </p>
            </div>
            <div className="bg-white border border-[#E9E6DF] rounded-2xl p-5">
              <p className="text-sm text-[#6B6B6B] mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#059669]">
                {getDealsByStage('COMPLETION').length}
              </p>
            </div>
          </div>

          {/* Pipeline Stages with Drag & Drop */}
          <div className="bg-white border border-[#E9E6DF] rounded-2xl p-6">
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {PIPELINE_STAGES.map((stage) => {
                  const stageDeals = getDealsByStage(stage.id);
                  return (
                    <DroppableStageColumn key={stage.id} stage={stage} deals={stageDeals} />
                  );
                })}
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeDeal ? (
                  <div className="opacity-60 rotate-3">
                    <DraggableDealCard deal={activeDeal} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      )}
    </>
  );
}
