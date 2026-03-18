import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ProgressionPipeline,
  PipelineStage,
} from '@/types/pipeline';
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from '@/types/pipeline';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { Loader2 } from 'lucide-react';

export function KanbanBoard() {
  useAuth();
  const [pipelines, setPipelines] = useState<ProgressionPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePipeline, setActivePipeline] = useState<ProgressionPipeline | null>(null);
  const lastUpdateRef = useRef<{ id: string; timestamp: number } | null>(null);

  // Fetch pipelines
  const fetchPipelines = async () => {
    try {
      setLoading(true);

      // Query pipelines
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('progression_pipeline')
        .select('*')
        .order('created_at', { ascending: false });

      if (pipelineError) throw pipelineError;
      if (!pipelineData || pipelineData.length === 0) {
        setPipelines([]);
        return;
      }

      // Get reservation IDs
      const reservationIds = pipelineData.map((p) => p.reservation_id);

      // Fetch reservations with deals and profiles
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          id,
          deal_id,
          investor_id,
          sourcer_id,
          reservation_fee_amount,
          status,
          deals (
            headline,
            approximate_location,
            strategy_type,
            thumbnail_url,
            capital_required
          ),
          investor:profiles!reservations_investor_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          sourcer:profiles!reservations_sourcer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .in('id', reservationIds);

      if (reservationsError) throw reservationsError;

      // Combine data
      const transformedData = pipelineData.map((pipeline) => {
        const reservation = reservationsData?.find((r) => r.id === pipeline.reservation_id);
        return {
          ...pipeline,
          reservation: reservation ? {
            ...reservation,
            deal: reservation.deals,
          } : null,
        };
      });

      setPipelines(transformedData as ProgressionPipeline[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching pipelines:', error);
      }
      toast.error('Failed to load deal pipeline');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    fetchPipelines();

    // Set up Realtime subscription
    const channel = supabase
      .channel('pipeline-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progression_pipeline',
        },
        (payload) => {
          // Check if this update is from the current user
          const isCurrentUserUpdate = lastUpdateRef.current &&
            payload.eventType === 'UPDATE' &&
            payload.new &&
            (payload.new as ProgressionPipeline).id === lastUpdateRef.current.id &&
            Date.now() - lastUpdateRef.current.timestamp < 2000; // Within 2 seconds

          // Only refetch if update is from another user
          if (!isCurrentUserUpdate) {
            fetchPipelines();

            // Show toast notification for updates from other users
            if (payload.eventType === 'UPDATE') {
              toast.info('Pipeline updated by another user');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const pipeline = pipelines.find((p) => p.id === event.active.id);
    setActivePipeline(pipeline || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActivePipeline(null);
      return;
    }

    const pipelineId = active.id as string;
    const newStage = over.id as PipelineStage;

    // Optimistic update
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === pipelineId ? { ...p, current_stage: newStage } : p
      )
    );
    setActivePipeline(null);

    try {
      // Track this update to prevent refetching on realtime event
      lastUpdateRef.current = { id: pipelineId, timestamp: Date.now() };

      const { error } = await supabase
        .from('progression_pipeline')
        .update({ current_stage: newStage })
        .eq('id', pipelineId);

      if (error) throw error;

      toast.success(`Deal moved to ${PIPELINE_STAGE_LABELS[newStage]}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating pipeline stage:', error);
      }
      toast.error('Failed to update deal stage');
      // Revert optimistic update
      fetchPipelines();
    }
  };

  // Group pipelines by stage
  const pipelinesByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = pipelines.filter((p) => p.current_stage === stage);
    return acc;
  }, {} as Record<PipelineStage, ProgressionPipeline[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Deals in Pipeline</h3>
          <p className="text-sm text-muted-foreground">
            Reserved deals will appear here once investors confirm their reservations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your deals through each stage. Drag cards to update progress.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{pipelines.length}</span> active deal{pipelines.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              pipelines={pipelinesByStage[stage]}
            />
          ))}
        </div>

        <DragOverlay>
          {activePipeline ? (
            <div className="opacity-50">
              <DealCard pipeline={activePipeline} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Realtime Status Indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-xs shadow-lg">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-muted-foreground">Live updates enabled</span>
      </div>
    </div>
  );
}
