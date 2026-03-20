import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export default function PipelinePage() {
  return (
    <div className="p-6 min-h-screen flex flex-col">
      <KanbanBoard />
    </div>
  );
}
