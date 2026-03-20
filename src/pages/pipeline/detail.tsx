import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { ProgressionPipeline, PipelineStage } from '@/types/pipeline';
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS, PIPELINE_STAGES } from '@/types/pipeline';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, MessageSquare, MapPin } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/date';
import { STRATEGY_LABELS } from '@/types/deal';
import { PayoutButton } from '@/components/stripe/PayoutButton';
import { useMessages } from '@/contexts/MessagesContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StageHistoryPanel } from '@/components/pipeline/StageHistoryPanel';

export default function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openThread } = useMessages();
  const [pipeline, setPipeline] = useState<ProgressionPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [currentStage, setCurrentStage] = useState<PipelineStage>('RESERVED');
  const [notes, setNotes] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);

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
          updated_at,
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
      <div className="w-full bg-[#F9F7F4] min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading pipeline details..." />
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

  // Determine other participant for messages
  const otherParticipant = pipeline && reservation
    ? user?.id === investor?.id
      ? sourcer
      : investor
    : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full bg-[#F9F7F4] min-h-screen">
      <div className="w-full px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/pipeline')}
        className="flex items-center gap-2 px-4 py-2 mb-6 text-sm text-[#1287ff] hover:text-[#0A6FE6] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pipeline
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          {deal?.thumbnail_url && (
            <div className="aspect-video rounded-2xl overflow-hidden border border-[#E9E6DF] bg-white">
              <img
                src={deal.thumbnail_url}
                alt={deal.headline}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1A1A1A] border border-[#E9E6DF]">
                    {deal && STRATEGY_LABELS[deal.strategy_type as keyof typeof STRATEGY_LABELS]}
                  </span>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${PIPELINE_STAGE_COLORS[pipeline.current_stage]}`}>
                    {PIPELINE_STAGE_LABELS[pipeline.current_stage]}
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-[#1A1A1A]">{deal?.headline}</h1>
                <div className="flex items-center gap-2 text-[#6B6B6B]">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{deal?.approximate_location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">Capital Required</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(deal?.capital_required || 0)}</p>
            </div>
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">Reservation Fee</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(reservation.reservation_fee_amount)}</p>
            </div>
          </div>

          {/* Deal Link */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Deal Information</h2>
            <p className="text-[#6B6B6B] mb-4">View the complete deal details and financial breakdown.</p>
            <Link to={`/dashboard/deals/${reservation.deal_id}`}>
              <Button variant="outline" size="sm" className="cursor-pointer rounded-xl">
                View Full Deal Details
              </Button>
            </Link>
          </div>

          {/* Update Stage Card */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Update Progress</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="stage" className="text-sm text-[#6B6B6B]">Current Stage</Label>
                <Select value={currentStage} onValueChange={(value) => setCurrentStage(value as PipelineStage)}>
                  <SelectTrigger id="stage" className="cursor-pointer rounded-xl mt-1.5">
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
                <Label htmlFor="estimated-date" className="text-sm text-[#6B6B6B]">Estimated Completion Date</Label>
                <input
                  id="estimated-date"
                  type="date"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                  value={estimatedCompletionDate}
                  onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm text-[#6B6B6B]">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about the current progress..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-1.5 rounded-xl"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full cursor-pointer rounded-xl bg-[#1287ff] hover:bg-[#0A6FE6] text-white"
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
          </div>

          {/* Stage History */}
          {pipeline.stage_history && pipeline.stage_history.length > 0 && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Stage History</h2>
                {pipeline.stage_history.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryPanelOpen(true)}
                    className="cursor-pointer rounded-lg text-[#1287ff] hover:text-[#0A6FE6]"
                  >
                    View All ({pipeline.stage_history.length})
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {pipeline.stage_history.slice(0, 5).map((entry, index) => (
                  <div
                    key={index}
                    className="pb-3 border-b border-[#E9E6DF] last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-[#1A1A1A]">
                      Moved to{' '}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PIPELINE_STAGE_COLORS[entry.stage]}`}>
                        {PIPELINE_STAGE_LABELS[entry.stage]}
                      </span>
                      {' '}at {formatDateTime(entry.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investor Info */}
          {investor && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Investor</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#1287ff] flex items-center justify-center text-white font-semibold">
                  {getInitials(investor.first_name, investor.last_name)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">
                    {investor.first_name} {investor.last_name}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">{(investor as any)?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sourcer Info */}
          {sourcer && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Sourcer</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#1287ff] flex items-center justify-center text-white font-semibold">
                  {getInitials(sourcer.first_name, sourcer.last_name)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">
                    {sourcer.first_name} {sourcer.last_name}
                  </p>
                  {(sourcer as any)?.company_name && (
                    <p className="text-sm text-[#6B6B6B]">{(sourcer as any)?.company_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reservation Info Card */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Reservation Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Reservation Fee</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {formatCurrency(reservation.reservation_fee_amount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Status</span>
                <span className="font-semibold text-[#1A1A1A] capitalize">{reservation.status.toLowerCase()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Payment</span>
                <span className="font-semibold text-[#1A1A1A]">{reservation.reservation_fee_paid ? 'Paid' : 'Pending'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Last Updated</span>
                <span className="font-semibold text-[#1A1A1A]">{formatDate((reservation as any).updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Payout Authorization - Only show for investors when deal is in COMPLETION stage */}
          {user?.id === investor?.id &&
            pipeline.current_stage === 'COMPLETION' &&
            reservation.status === 'CONFIRMED' && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Authorize Payout</h3>
              <p className="text-sm text-[#6B6B6B] mb-4">
                The deal has reached completion. Authorize the payout to release funds to the sourcer.
              </p>
              <PayoutButton
                reservationId={reservation.id}
                reservationFeeAmount={reservation.reservation_fee_amount}
                sourcerName={`${sourcer?.first_name} ${sourcer?.last_name}`}
                onSuccess={fetchPipeline}
              />
            </div>
          )}

          {/* Messaging */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Communication</h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Use the messaging system to communicate about this deal.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full cursor-pointer rounded-xl border-[#E9E6DF] hover:border-[#1287ff] text-[#1A1A1A] hover:text-[#1287ff]"
              onClick={() => {
                if (otherParticipant && deal) {
                  openThread({
                    reservationId: reservation.id,
                    dealHeadline: deal.headline,
                    otherParticipant: {
                      id: otherParticipant.id,
                      first_name: otherParticipant.first_name,
                      last_name: otherParticipant.last_name,
                      avatar_url: otherParticipant.avatar_url,
                      role: otherParticipant.id === investor?.id ? 'INVESTOR' : 'SOURCER',
                    },
                  });
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Messages
            </Button>
          </div>
        </div>
      </div>

      {/* Stage History Panel */}
      {pipeline.stage_history && (
        <StageHistoryPanel
          history={pipeline.stage_history}
          open={historyPanelOpen}
          onClose={() => setHistoryPanelOpen(false)}
        />
      )}
      </div>
    </div>
  );
}
