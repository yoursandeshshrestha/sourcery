import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching applications:', error);
      }
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (app: Application, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setDialogAction(action);
    setRejectionReason('');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedApp || !dialogAction) return;

    // Validate rejection reason is required
    if (dialogAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingId(selectedApp.id);

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
        .eq('id', selectedApp.id);

      if (error) throw error;

      toast.success(
        dialogAction === 'approve'
          ? `${selectedApp.first_name} ${selectedApp.last_name} has been approved as a sourcer`
          : `Application from ${selectedApp.first_name} ${selectedApp.last_name} has been rejected`
      );

      // Refresh the list
      await fetchApplications();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error ${dialogAction}ing application:`, error);
      }
      toast.error(`Failed to ${dialogAction} application`);
    } finally {
      setProcessingId(null);
      setDialogOpen(false);
      setSelectedApp(null);
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

  return (
    <div className="px-6 py-8 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sourcer Applications</h1>
        <p className="text-muted-foreground">
          Review and approve or reject sourcer applications
        </p>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-border rounded-md">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No pending applications</p>
          <p className="text-sm text-muted-foreground">
            All sourcer applications have been reviewed
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    // Don't navigate if clicking on buttons
                    if ((e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    window.open(`/dashboard/admin/applications/${app.id}`, '_blank');
                  }}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {app.first_name} {app.last_name}
                      </p>
                      <Badge className="mt-1.5 bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20">
                        Pending Review
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{app.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.phone || 'No phone'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {app.company_name || (
                      <span className="text-muted-foreground">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(app.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(app, 'approve');
                        }}
                        disabled={processingId === app.id}
                        size="sm"
                        className="cursor-pointer bg-green-600 hover:bg-green-700"
                      >
                        {processingId === app.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(app, 'reject');
                        }}
                        disabled={processingId === app.id}
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
                    {selectedApp?.first_name} {selectedApp?.last_name}
                  </span>
                  's application? They will be granted sourcer access and can start posting deals.
                </>
              ) : (
                <>
                  Are you sure you want to reject{' '}
                  <span className="font-medium">
                    {selectedApp?.first_name} {selectedApp?.last_name}
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
    </div>
  );
}
