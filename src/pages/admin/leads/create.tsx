import { LeadForm } from '@/components/leads/LeadForm';

export default function CreateLeadPage() {
  return (
    <div className="px-6 pt-6 pb-24 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Lead</h1>
        <p className="text-muted-foreground">
          Add a new motivated seller contact to the marketplace
        </p>
      </div>

      <LeadForm mode="create" />
    </div>
  );
}
