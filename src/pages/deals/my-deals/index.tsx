import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Deal } from '@/types/deal';
import { STATUS_LABELS, STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Edit, Eye, Building2, Trash2, MoreVertical } from 'lucide-react';
import { formatDate } from '@/lib/date';

export default function MyDealsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyDeals();
  }, []);

  const fetchMyDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('sourcer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeals(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching deals:', error);
      }
      toast.error('Failed to load your deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealToDelete.id);

      if (error) throw error;

      toast.success('Deal deleted successfully');
      await fetchMyDeals();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting deal:', error);
      }
      toast.error('Failed to delete deal');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
      ACTIVE: 'bg-green-100 text-green-700 border-green-300',
      RESERVED: 'bg-blue-100 text-blue-700 border-blue-300',
      COMPLETED: 'bg-purple-100 text-purple-700 border-purple-300',
      CANCELLED: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
      <Badge variant="outline" className={variants[status] || variants.DRAFT}>
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
      </Badge>
    );
  };

  const getStrategyBadge = (strategy: string) => {
    const variants: Record<string, string> = {
      FLIP: 'bg-orange-100 text-orange-700 border-orange-300',
      HMO: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      R2R: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      BTL: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      BRRR: 'bg-violet-100 text-violet-700 border-violet-300',
    };

    return (
      <Badge variant="outline" className={variants[strategy] || 'bg-slate-100 text-slate-700 border-slate-300'}>
        {STRATEGY_LABELS[strategy as keyof typeof STRATEGY_LABELS]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-8 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Deals</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button onClick={() => navigate('/dashboard/deals/create')} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Create Deal
        </Button>
      </div>

      {/* Deals Table */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-md">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-1">No deals yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start by creating your first property deal
          </p>
          <Button onClick={() => navigate('/dashboard/deals/create')} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Deal
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capital Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">
                    <div title={deal.headline}>
                      {truncateText(deal.headline, 20)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStrategyBadge(deal.strategy_type)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {deal.approximate_location}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(deal.capital_required)}
                  </TableCell>
                  <TableCell>{getStatusBadge(deal.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {deal.view_count}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(deal.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.open(`/dashboard/deals/${deal.id}`, '_blank')}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/dashboard/my-deals/${deal.id}/edit`)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(deal)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">"{dealToDelete?.headline}"</span>?{' '}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Deal'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
