import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Deal } from '@/types/deal';
import { DealForm } from '@/components/deals/DealForm';
import { Loader2 } from 'lucide-react';

export default function EditDealPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Deal not found');
        navigate('/dashboard/my-deals');
        return;
      }

      // Check ownership
      if (data.sourcer_id !== user?.id) {
        toast.error('You do not have permission to edit this deal');
        navigate('/dashboard/my-deals');
        return;
      }

      setDeal(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching deal:', error);
      }
      toast.error('Failed to load deal');
      navigate('/dashboard/my-deals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <div className="px-6 pt-6 pb-24 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Deal</h1>
        <p className="text-muted-foreground">
          Update your property listing
        </p>
      </div>

      <DealForm mode="edit" deal={deal} />
    </div>
  );
}
