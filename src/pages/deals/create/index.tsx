import { DealForm } from '@/components/deals/DealForm';

export default function CreateDealPage() {
  return (
    <div className="px-6 py-8 w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Deal</h1>
        <p className="text-muted-foreground">
          List a new property investment opportunity
        </p>
      </div>

      <DealForm mode="create" />
    </div>
  );
}
