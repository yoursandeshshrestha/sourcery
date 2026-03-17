import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ProgressionPipeline } from '@/types/pipeline';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, MapPin, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
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
  const sourcer = reservation?.sourcer;

  if (!reservation || !deal) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      {/* Deal Thumbnail */}
      {deal.thumbnail_url && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={deal.thumbnail_url}
            alt={deal.headline}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Deal Info */}
      <div className="space-y-2">
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
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={investor?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {investor ? getInitials(investor.first_name, investor.last_name) : 'IN'}
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-6 w-6">
              <AvatarImage src={sourcer?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {sourcer ? getInitials(sourcer.first_name, sourcer.last_name) : 'SO'}
              </AvatarFallback>
            </Avatar>
          </div>

          <Link to={`/dashboard/pipeline/${pipeline.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </div>

      {/* Notes Preview */}
      {pipeline.notes && (
        <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground line-clamp-2">
          {pipeline.notes}
        </div>
      )}
    </div>
  );
}
