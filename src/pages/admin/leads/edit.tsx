import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { DansLead } from '@/types/lead';
import { LeadForm } from '@/components/leads/LeadForm';
import { Loader2 } from 'lucide-react';

export default function EditLeadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<DansLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/dashboard/admin/leads');
      return;
    }

    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('dans_leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Lead not found');
        navigate('/dashboard/admin/leads');
        return;
      }

      setLead(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching lead:', error);
      }
      toast.error('Failed to load lead');
      navigate('/dashboard/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 pb-24 w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="px-6 pt-6 pb-24 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Edit Lead</h1>
        <p className="text-muted-foreground">
          Update the lead details below
        </p>
      </div>

      <LeadForm lead={lead} mode="edit" />
    </div>
  );
}
