import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGE_COLORS } from '@/types/pipeline';
import { formatDateTime } from '@/lib/date';
import type { PipelineStage } from '@/types/pipeline';

interface StageHistoryEntry {
  stage: PipelineStage;
  timestamp: string;
}

interface StageHistoryPanelProps {
  history: StageHistoryEntry[];
  open: boolean;
  onClose: () => void;
}

export function StageHistoryPanel({ history, open, onClose }: StageHistoryPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentHistory = history.slice(startIndex, endIndex);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-[500px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9E6DF]">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Stage History</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-[#6B6B6B] mb-6">
            Complete history of all stage changes for this deal.
          </p>

          <div className="space-y-3">
            {currentHistory.map((entry, index) => (
              <div
                key={startIndex + index}
                className="rounded-xl border border-[#E9E6DF] bg-white p-4 hover:shadow-sm transition-shadow"
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

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-[#E9E6DF] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B6B6B]">
                Showing {startIndex + 1}-{Math.min(endIndex, history.length)} of {history.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-[#6B6B6B]">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
