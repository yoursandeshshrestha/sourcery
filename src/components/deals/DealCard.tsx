import { Link } from 'react-router-dom';
import { MapPin, Building2, Heart, Bed, Bath } from 'lucide-react';
import type { Deal } from '@/types/deal';
import { STRATEGY_LABELS } from '@/types/deal';

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9E6DF] overflow-hidden cursor-pointer group">
      <Link to={`/deals/${deal.id}`} className="block">
        {/* Image */}
        <div className="aspect-video bg-[#F9F7F4] relative overflow-hidden">
          {deal.thumbnail_url ? (
            <img
              src={deal.thumbnail_url}
              alt={deal.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-12 w-12 text-[#C5C0B8]" />
            </div>
          )}
          {/* Strategy Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1A1A1A] shadow-sm">
              {STRATEGY_LABELS[deal.strategy_type]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug line-clamp-1 text-[#1A1A1A] mb-2">
            {deal.headline}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="h-4 w-4 text-[#6B6B6B] shrink-0" />
            <p className="text-sm text-[#6B6B6B] line-clamp-1">{deal.approximate_location}</p>
          </div>

          {/* Metrics */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">Capital Required</span>
              <span className="font-semibold text-sm text-[#1A1A1A]">{formatCurrency(deal.capital_required)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">ROI</span>
              <span className="font-semibold text-sm text-emerald-600">{formatPercentage(deal.calculated_roi)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">Yield</span>
              <span className="font-semibold text-sm text-[#1A1A1A]">{formatPercentage(deal.calculated_yield)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E9E6DF]">
              <span className="text-sm text-[#6B6B6B]">Sourcing Fee</span>
              <span className="font-semibold text-sm text-[#1A1A1A]">{formatCurrency(deal.sourcing_fee)}</span>
            </div>
          </div>

          {/* Reserve Button */}
          <button className="w-full py-2.5 bg-[#1287ff] hover:bg-[#0A6FE6] text-white text-sm font-semibold rounded-xl transition-colors">
            Reserve Now
          </button>
        </div>
      </Link>
    </div>
  );
}
