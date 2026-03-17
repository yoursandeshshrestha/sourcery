import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle2, XCircle, ExternalLink, FileText, ArrowLeft } from 'lucide-react';
import { formatDateTime } from '@/lib/date';

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  bio: string | null;
  verification_status: string;
  id_document_url: string | null;
  aml_document_url: string | null;
  insurance_document_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('verification_status', 'PENDING')
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Application not found');
        navigate('/dashboard/admin/applications');
        return;
      }

      setApplication(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching application:', error);
      }
      toast.error('Failed to load application');
      navigate('/dashboard/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: 'approve' | 'reject') => {
    setDialogAction(action);
    setRejectionReason('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!application || !dialogAction) return;

    // Validate rejection reason is required
    if (dialogAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);

      const updates: {
        verification_status: 'VERIFIED' | 'REJECTED';
        role?: 'SOURCER';
        rejection_reason?: string;
      } = {
        verification_status: dialogAction === 'approve' ? 'VERIFIED' : 'REJECTED',
      };

      // If approving, change role to SOURCER
      if (dialogAction === 'approve') {
        updates.role = 'SOURCER';
      }

      // If rejecting, save the reason
      if (dialogAction === 'reject') {
        updates.rejection_reason = rejectionReason.trim();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', application.id);

      if (error) throw error;

      toast.success(
        dialogAction === 'approve'
          ? `${application.first_name} ${application.last_name} has been approved as a sourcer`
          : `Application from ${application.first_name} ${application.last_name} has been rejected`
      );

      // Navigate back to applications list
      navigate('/dashboard/admin/applications');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error ${dialogAction}ing application:`, error);
      }
      toast.error(`Failed to ${dialogAction} application`);
    } finally {
      setProcessing(false);
      setDialogOpen(false);
      setDialogAction(null);
      setRejectionReason('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <>
      <div className="px-6 py-8 w-full pb-32">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/admin/applications')}
            className="mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {application.first_name} {application.last_name}
              </h1>
              <p className="text-muted-foreground">
                Applied {formatDateTime(application.created_at)}
              </p>
            </div>
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20">
              Pending Review
            </Badge>
          </div>
        </div>

        {/* Application Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <p className="text-sm">{application.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                <p className="text-sm">{application.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Company</p>
                <p className="text-sm">{application.company_name || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {application.bio && (
            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Bio</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.bio}</p>
            </div>
          )}

          {/* KYC Documents */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">KYC Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ID Document */}
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">ID Document</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Valid passport or driver's license
                </p>
                {application.id_document_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full cursor-pointer"
                  >
                    <a
                      href={application.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center">
                    Not uploaded
                  </Badge>
                )}
              </div>

              {/* AML Certificate */}
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">AML Certificate</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Anti-Money Laundering certificate
                </p>
                {application.aml_document_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full cursor-pointer"
                  >
                    <a
                      href={application.aml_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center">
                    Not uploaded
                  </Badge>
                )}
              </div>

              {/* Insurance Certificate */}
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Insurance Certificate</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Professional indemnity insurance
                </p>
                {application.insurance_document_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full cursor-pointer"
                  >
                    <a
                      href={application.insurance_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center">
                    Not uploaded
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div
        className="fixed bottom-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-10 transition-all duration-300"
        style={{ left: isCollapsed ? '64px' : '256px' }}
      >
        <div className="flex gap-3 justify-end px-6 py-4">
          <Button
            onClick={() => handleAction('reject')}
            disabled={processing}
            variant="destructive"
            size="lg"
            className="cursor-pointer"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Application
          </Button>
          <Button
            onClick={() => handleAction('approve')}
            disabled={processing}
            size="lg"
            className="cursor-pointer bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Application
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'approve' ? 'Approve Application' : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'approve' ? (
                <>
                  Are you sure you want to approve{' '}
                  <span className="font-medium">
                    {application.first_name} {application.last_name}
                  </span>
                  's application? They will be granted sourcer access and can start posting deals.
                </>
              ) : (
                <>
                  Are you sure you want to reject{' '}
                  <span className="font-medium">
                    {application.first_name} {application.last_name}
                  </span>
                  's application? They can reapply in the future.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Rejection Reason Input */}
          {dialogAction === 'reject' && (
            <div className="space-y-2 py-4">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a clear reason for rejecting this application..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be visible to the applicant.
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" onClick={() => setRejectionReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                dialogAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  : 'bg-destructive hover:bg-destructive/90 cursor-pointer'
              }
            >
              {dialogAction === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
