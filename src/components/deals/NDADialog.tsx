import { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Deal } from '@/types/deal';

interface NDADialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (signatureName: string) => void;
}

export function NDADialog({ deal, open, onOpenChange, onAccept }: NDADialogProps) {
  const [agreed, setAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = () => {
    // Validate
    if (!agreed) {
      setError('You must agree to the terms to proceed');
      return;
    }

    if (!signatureName.trim()) {
      setError('Please enter your full name as your digital signature');
      return;
    }

    if (signatureName.trim().length < 3) {
      setError('Please enter your full name (at least 3 characters)');
      return;
    }

    // Clear error and proceed
    setError(null);
    onAccept(signatureName.trim());
  };

  const handleClose = () => {
    if (!agreed && !signatureName) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-background border border-border rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Non-Disclosure & Reservation Agreement
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Please read and sign before proceeding with payment
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Deal Info Alert */}
            <Alert className="border-primary/20 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong className="font-semibold text-foreground">Deal:</strong>{' '}
                {deal.headline} - {deal.approximate_location}
              </AlertDescription>
            </Alert>

            {/* Legal Text */}
            <div className="prose prose-sm max-w-none space-y-4 text-foreground/90">
              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  1. Agreement Overview
                </h3>
                <p className="text-sm leading-relaxed">
                  This Non-Disclosure and Reservation Agreement ("Agreement") is entered into between
                  <strong> {deal.sourcer?.company_name || `${deal.sourcer?.first_name} ${deal.sourcer?.last_name}`}</strong>
                  {' '}("Sourcer") and you ("Investor") concerning the property investment opportunity
                  referenced as <strong>"{deal.headline}"</strong>.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  2. Confidential Information
                </h3>
                <p className="text-sm leading-relaxed">
                  Upon payment of the Reservation Fee, you will gain access to confidential information including,
                  but not limited to: the exact property address, vendor contact details, legal documentation,
                  financial projections, and any other proprietary information related to this deal.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  3. Non-Disclosure Obligations
                </h3>
                <p className="text-sm leading-relaxed mb-2">You agree to:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Keep all confidential information strictly confidential</li>
                  <li>Not share, disclose, or distribute the property address or vendor details to any third party</li>
                  <li>Not contact the vendor directly without the Sourcer's written consent</li>
                  <li>Not use the confidential information for any purpose other than evaluating this investment opportunity</li>
                  <li>Not attempt to circumvent the Sourcer or the Sourcery platform to complete this transaction</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  4. Reservation Fee Terms
                </h3>
                <p className="text-sm leading-relaxed">
                  The Reservation Fee of <strong>£{deal.reservation_fee.toLocaleString('en-GB')}</strong> is
                  non-refundable except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 mt-2">
                  <li>Material misrepresentation of the property by the Sourcer</li>
                  <li>Property is no longer available due to Sourcer's fault</li>
                  <li>Failure of the Sourcer to provide promised documentation within 7 business days</li>
                </ul>
                <p className="text-sm leading-relaxed mt-2">
                  The Reservation Fee will be held in escrow by Sourcery until the deal reaches completion,
                  at which point it will be transferred to the Sourcer (minus platform commission).
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  5. Deal Progression
                </h3>
                <p className="text-sm leading-relaxed">
                  Both parties agree to work in good faith to progress the transaction through legal due diligence,
                  valuation, mortgage approval (if applicable), and exchange of contracts. The Sourcery platform
                  will provide a shared workspace to track this progression.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  6. Withdrawal and Cancellation
                </h3>
                <p className="text-sm leading-relaxed">
                  If you choose to withdraw from the deal after making payment, the Reservation Fee is forfeited
                  unless one of the refund conditions in Section 4 applies. You must notify the Sourcer through
                  the Sourcery platform and provide a reason for withdrawal.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  7. Dispute Resolution
                </h3>
                <p className="text-sm leading-relaxed">
                  Any disputes arising from this Agreement will first be mediated by Sourcery platform administrators.
                  If mediation fails, disputes will be resolved through binding arbitration under the laws of England and Wales.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  8. Data Processing
                </h3>
                <p className="text-sm leading-relaxed">
                  Your digital signature, IP address, and timestamp will be recorded for legal compliance and dispute
                  resolution purposes. This data will be stored securely in accordance with UK GDPR regulations.
                </p>
              </section>
            </div>

            {/* Digital Signature Section */}
            <div className="border border-border rounded-lg p-6 bg-muted/30 space-y-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Digital Signature
              </h3>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="nda-agree"
                  checked={agreed}
                  onCheckedChange={(checked) => {
                    setAgreed(checked === true);
                    setError(null);
                  }}
                  className="cursor-pointer mt-1"
                />
                <label
                  htmlFor="nda-agree"
                  className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                  I have read and understood this Non-Disclosure and Reservation Agreement,
                  and I agree to be legally bound by its terms and conditions.
                </label>
              </div>

              {/* Signature Name Field */}
              <div className="space-y-2">
                <Label htmlFor="signature" className="text-sm font-medium">
                  Your Full Name (Digital Signature) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="signature"
                  type="text"
                  placeholder="Enter your full legal name"
                  value={signatureName}
                  onChange={(e) => {
                    setSignatureName(e.target.value);
                    setError(null);
                  }}
                  disabled={!agreed}
                  className={error ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  By typing your name, you acknowledge this as your legal digital signature
                </p>
              </div>

              {/* Date Display */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Date:</span>
                <span className="font-medium text-foreground">{currentDate}</span>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-4 border-t border-border bg-muted/30">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground hover:bg-muted text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!agreed || !signatureName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              Sign & Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
