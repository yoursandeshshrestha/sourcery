import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ProgressionPipeline, PipelineStage } from '@/types/pipeline';
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types/pipeline';
import { DealCard } from './DealCard';

interface KanbanColumnProps {
  stage: PipelineStage;
  pipelines: ProgressionPipeline[];
}

export function KanbanColumn({ stage, pipelines }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const stageColor = PIPELINE_STAGE_COLORS[stage];

  return (
    <div className="shrink-0 w-80">
      {/* Column Header */}
      <div className="mb-3">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stageColor}`}>
          {PIPELINE_STAGE_LABELS[stage]}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {pipelines.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`min-h-[500px] rounded-md border-2 border-dashed p-2 transition-colors ${
          isOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20'
        }`}
      >
        <SortableContext
          items={pipelines.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {pipelines.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Drop deals here
              </div>
            ) : (
              pipelines.map((pipeline) => (
                <DealCard key={pipeline.id} pipeline={pipeline} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
