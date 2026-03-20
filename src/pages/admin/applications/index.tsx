import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loader2, CheckCircle2, XCircle, FileText, Search, ChevronLeft, ChevronRight, Clock, Check, X, Ban } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { debounce } from '@/lib/utils';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [debouncedSearch, setDebouncedSearch] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    return searchParams.get('status') || 'PENDING';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Debounced search function
  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500)
  );

  useEffect(() => {
    debouncedSearchRef.current = debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500);
  }, []);

  // Sync all filters from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');

    setStatusFilter(statusParam || 'PENDING');
    setSearchQuery(searchParam || '');
    setDebouncedSearch(searchParam || '');
    setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
  }, [searchParams]);

  // Set initial URL params if not present
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let updated = false;

    if (!searchParams.has('status')) {
      params.set('status', 'PENDING');
      updated = true;
    }
    if (!searchParams.has('search')) {
      params.set('search', '');
      updated = true;
    }
    if (!searchParams.has('page')) {
      params.set('page', '1');
      updated = true;
    }

    if (updated) {
      setSearchParams(params, { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('verification_status', 'is', null);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const { count, error } = await query;

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching stats:', error);
      }
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select('*')
        .not('verification_status', 'is', null);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error } = await query;

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

      // Remove application from local state instead of refetching
      setApplications(prevApps => prevApps.filter(app => app.id !== selectedApp.id));
      setTotalCount(prev => Math.max(0, prev - 1));
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof Clock }> = {
      PENDING: { label: 'Pending Review', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800', icon: Clock },
      VERIFIED: { label: 'Approved', className: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800', icon: Check },
      REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800', icon: X },
      CANCELLED: { label: 'Cancelled', className: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800', icon: Ban },
    };

    const config = variants[status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Sourcer Applications</h1>
          <p className="text-muted-foreground">
            Review and approve or reject sourcer applications ({totalCount} {totalCount === 1 ? 'application' : 'applications'})
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              setCurrentPage(1);

              // Debounce the actual search
              debouncedSearchRef.current(value);

              // Update URL immediately for UX
              const params = new URLSearchParams(searchParams);
              params.set('search', value);
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="pl-9 rounded-lg"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);

            // Update URL
            const params = new URLSearchParams(searchParams);
            params.set('status', value);
            params.set('page', '1');
            setSearchParams(params);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] cursor-pointer rounded-lg">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              <div className="flex items-center">
                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                All Statuses
              </div>
            </SelectItem>
            <SelectItem value="PENDING" className="cursor-pointer">
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-2 text-yellow-600" />
                Pending
              </div>
            </SelectItem>
            <SelectItem value="VERIFIED" className="cursor-pointer">
              <div className="flex items-center">
                <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
                Approved
              </div>
            </SelectItem>
            <SelectItem value="REJECTED" className="cursor-pointer">
              <div className="flex items-center">
                <X className="h-3.5 w-3.5 mr-2 text-red-600" />
                Rejected
              </div>
            </SelectItem>
            <SelectItem value="CANCELLED" className="cursor-pointer">
              <div className="flex items-center">
                <Ban className="h-3.5 w-3.5 mr-2 text-gray-600" />
                Cancelled
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {(searchQuery || statusFilter !== 'PENDING') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setDebouncedSearch('');
              setStatusFilter('PENDING');
              setCurrentPage(1);

              // Reset URL params to defaults
              const params = new URLSearchParams();
              params.set('status', 'PENDING');
              params.set('search', '');
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="cursor-pointer whitespace-nowrap rounded-lg"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Applications Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner message="Loading applications..." />
          </div>
        ) : applications.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">
              {searchQuery || statusFilter !== 'PENDING' ? 'No applications found' : 'No pending applications'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'PENDING'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'All sourcer applications have been reviewed'}
            </p>
          </div>
        ) : (
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
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/dashboard/admin/applications/${app.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {app.first_name} {app.last_name}
                      </p>
                      <div className="mt-1.5">
                        {getStatusBadge(app.verification_status)}
                      </div>
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
                    {app.verification_status === 'PENDING' ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(app, 'approve');
                          }}
                          disabled={processingId === app.id}
                          size="sm"
                          className="cursor-pointer bg-green-600 hover:bg-green-700 rounded-lg"
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
                          className="cursor-pointer rounded-lg"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalCount} applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);

                // Update URL
                const params = new URLSearchParams(searchParams);
                params.set('page', newPage.toString());
                setSearchParams(params);
              }}
              disabled={currentPage === 1}
              className="cursor-pointer rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1);
                setCurrentPage(newPage);

                // Update URL
                const params = new URLSearchParams(searchParams);
                params.set('page', newPage.toString());
                setSearchParams(params);
              }}
              disabled={currentPage === totalPages}
              className="cursor-pointer rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
            <AlertDialogCancel className="cursor-pointer rounded-lg" onClick={() => setRejectionReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                dialogAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 cursor-pointer rounded-lg'
                  : 'bg-destructive hover:bg-destructive/90 cursor-pointer rounded-lg'
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
