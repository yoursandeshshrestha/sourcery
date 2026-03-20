import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ProgressionPipeline } from '@/types/pipeline';
import { Button } from '@/components/ui/button';
import { Home, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { STRATEGY_LABELS } from '@/types/deal';
import { formatDate } from '@/lib/date';
import { Link } from 'react-router-dom';

interface DealCardProps {
  pipeline: ProgressionPipeline;
  isDragging?: boolean;
}

export function DealCard({ pipeline, isDragging = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: pipeline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const reservation = pipeline.reservation;
  const deal = reservation?.deal;
  const investor = reservation?.investor;

  if (!reservation || !deal) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      {/* Deal Thumbnail */}
      {deal.thumbnail_url && (
        <div className="relative aspect-video overflow-hidden bg-gray-50">
          <img
            src={deal.thumbnail_url}
            alt={deal.headline}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Deal Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2">{deal.headline}</h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {deal.approximate_location}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Home className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{STRATEGY_LABELS[deal.strategy_type as keyof typeof STRATEGY_LABELS]}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">
            £{deal.capital_required.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {pipeline.estimated_completion_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Est. {formatDate(pipeline.estimated_completion_date)}
          </div>
        )}
      </div>

      {/* Participants */}
      <div className={`px-4 pt-3 border-t border-border ${!pipeline.notes ? 'pb-4' : 'pb-2'}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {investor ? `${investor.first_name} ${investor.last_name}` : 'Investor'}
          </div>

          <Link
            to={`/dashboard/pipeline/${pipeline.id}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 cursor-pointer rounded-lg text-xs"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Notes Preview */}
      {pipeline.notes && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-muted rounded-lg text-xs text-muted-foreground line-clamp-2">
            {pipeline.notes}
          </div>
        </div>
      )}
    </div>
  );
}
