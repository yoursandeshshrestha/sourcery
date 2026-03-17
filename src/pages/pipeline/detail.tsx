import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { ProgressionPipeline, PipelineStage } from '@/types/pipeline';
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS, PIPELINE_STAGES } from '@/types/pipeline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Save, Home, MapPin, TrendingUp, Calendar, Clock, MessageSquare } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/date';
import { STRATEGY_LABELS } from '@/types/deal';
import { PayoutButton } from '@/components/stripe/PayoutButton';

export default function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<ProgressionPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [currentStage, setCurrentStage] = useState<PipelineStage>('RESERVED');
  const [notes, setNotes] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');

  // Fetch pipeline details
  const fetchPipeline = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch pipeline
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('progression_pipeline')
        .select('*')
        .eq('id', id)
        .single();

      if (pipelineError) throw pipelineError;

      // Fetch reservation with deals and profiles
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          id,
          deal_id,
          investor_id,
          sourcer_id,
          reservation_fee_amount,
          reservation_fee_paid,
          status,
          created_at,
          deals (
            headline,
            approximate_location,
            strategy_type,
            thumbnail_url,
            capital_required,
            full_address
          ),
          investor:profiles!reservations_investor_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            company_name
          ),
          sourcer:profiles!reservations_sourcer_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            company_name
          )
        `)
        .eq('id', pipelineData.reservation_id)
        .single();

      if (reservationError) throw reservationError;

      // Combine data
      const combinedData = {
        ...pipelineData,
        reservation: {
          ...reservationData,
          deal: reservationData.deals,
        },
      } as unknown as ProgressionPipeline;
      setPipeline(combinedData);
      setCurrentStage(combinedData.current_stage);
      setNotes(combinedData.notes || '');
      setEstimatedCompletionDate(combinedData.estimated_completion_date || '');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching pipeline:', error);
      }
      toast.error('Failed to load pipeline details');
      navigate('/dashboard/pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`pipeline-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'progression_pipeline',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchPipeline();
          toast.info('Pipeline updated by another user');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('progression_pipeline')
        .update({
          current_stage: currentStage,
          notes: notes.trim() || null,
          estimated_completion_date: estimatedCompletionDate || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Pipeline updated successfully');
      fetchPipeline();
    } catch (error) {
      toast.error('Failed to update pipeline');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!pipeline || !pipeline.reservation) {
    return null;
  }

  const { reservation } = pipeline;
  const deal = reservation.deal;
  const investor = reservation.investor;
  const sourcer = reservation.sourcer;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="container py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/pipeline')}
          className="mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pipeline
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{deal?.headline}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pipeline ID: {pipeline.id}
            </p>
          </div>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${PIPELINE_STAGE_COLORS[pipeline.current_stage]}`}>
            {PIPELINE_STAGE_LABELS[pipeline.current_stage]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Info Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Deal Information</h2>

            {deal?.thumbnail_url && (
              <div className="mb-4 rounded-md overflow-hidden">
                <img
                  src={deal.thumbnail_url}
                  alt={deal.headline}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{deal?.approximate_location}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>{deal && STRATEGY_LABELS[deal.strategy_type as keyof typeof STRATEGY_LABELS]}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  £{deal?.capital_required.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="pt-3 border-t border-border">
                <Link to={`/dashboard/deals/${reservation.deal_id}`}>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    View Full Deal Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Update Stage Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Update Progress</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="stage">Current Stage</Label>
                <Select value={currentStage} onValueChange={(value) => setCurrentStage(value as PipelineStage)}>
                  <SelectTrigger id="stage" className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage} className="cursor-pointer">
                        {PIPELINE_STAGE_LABELS[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated-date">Estimated Completion Date</Label>
                <input
                  id="estimated-date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={estimatedCompletionDate}
                  onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about the current progress..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Stage History */}
          {pipeline.stage_history && pipeline.stage_history.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Stage History</h2>

              <div className="space-y-3">
                {pipeline.stage_history.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PIPELINE_STAGE_COLORS[entry.stage]}`}>
                        {PIPELINE_STAGE_LABELS[entry.stage]}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Participants</h2>

            <div className="space-y-4">
              {/* Investor */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Investor</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={investor?.avatar_url || undefined} />
                    <AvatarFallback>
                      {investor && getInitials(investor.first_name, investor.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {investor?.first_name} {investor?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{investor?.email}</p>
                  </div>
                </div>
              </div>

              {/* Sourcer */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sourcer</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={sourcer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {sourcer && getInitials(sourcer.first_name, sourcer.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {sourcer?.first_name} {sourcer?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{sourcer?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Reservation Info Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Reservation Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reservation Fee:</span>
                <span className="font-medium">
                  £{reservation.reservation_fee_amount.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{reservation.status.toLowerCase()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-medium">{reservation.reservation_fee_paid ? 'Paid' : 'Pending'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Reserved:</span>
                <span className="font-medium">{formatDate(reservation.created_at)}</span>
              </div>
            </div>
          </Card>

          {/* Payout Authorization - Only show for investors when deal is in COMPLETION stage */}
          {user?.id === investor?.id &&
            pipeline.current_stage === 'COMPLETION' &&
            reservation.status === 'CONFIRMED' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Authorize Payout</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The deal has reached completion. Authorize the payout to release funds to the sourcer.
              </p>
              <PayoutButton
                reservationId={reservation.id}
                reservationFeeAmount={reservation.reservation_fee_amount}
                sourcerName={`${sourcer?.first_name} ${sourcer?.last_name}`}
                onSuccess={fetchPipeline}
              />
            </Card>
          )}

          {/* Messaging */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Communication</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use the messaging system to communicate about this deal.
            </p>
            <Link to={`/dashboard/messages/${reservation.deal_id}`}>
              <Button variant="outline" size="sm" className="w-full cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Messages
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
