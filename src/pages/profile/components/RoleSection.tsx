import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Shield, CheckCircle2, AlertCircle, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SourcerApplicationModal } from './SourcerApplicationModal';

const ROLE_LABELS = {
  INVESTOR: 'Investor',
  SOURCER: 'Deal Sourcer',
  ADMIN: 'Administrator',
};

const ROLE_DESCRIPTIONS = {
  INVESTOR: 'Browse and reserve property deals',
  SOURCER: 'List property deals and earn sourcing fees',
  ADMIN: 'Platform administrator with full access',
};

const VERIFICATION_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-900',
  },
  VERIFIED: {
    label: 'Verified',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-900',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: Ban,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    borderColor: 'border-gray-200 dark:border-gray-900',
  },
};

export function RoleSection() {
  const { profile, user, refreshProfile } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!profile) return null;

  // Role and status checks
  const isInvestor = profile.role === 'INVESTOR';
  const verificationStatus = profile.verification_status;

  // Application state logic
  const hasPendingApplication = isInvestor && verificationStatus === 'PENDING';
  const hasRejectedApplication = isInvestor && verificationStatus === 'REJECTED';
  const hasCancelledApplication = isInvestor && verificationStatus === 'CANCELLED';
  const canApply = isInvestor && (!verificationStatus || hasRejectedApplication || hasCancelledApplication);

  const handleCancelApplication = async () => {
    if (!user) return;

    setIsCancelling(true);
    try {
      // Clear application data and set status to CANCELLED
      // Role stays INVESTOR (already is)
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'CANCELLED',
          company_name: null,
          bio: null,
          id_document_url: null,
          aml_document_url: null,
          insurance_document_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setShowCancelDialog(false);
      toast.success('Application cancelled successfully');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to cancel application:', error);
      }
      toast.error('Failed to cancel application. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const StatusIcon = verificationStatus
    ? VERIFICATION_STATUS_CONFIG[verificationStatus].icon
    : null;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Section Header */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">
            Account Role
          </h3>
          <p className="text-xs text-muted-foreground">
            Your account type and verification status
          </p>
        </div>

        {/* Content */}
        <section className="rounded-[7px] bg-card border border-border">
          <ul className="min-w-0 min-h-0">
            {/* Current Role */}
            <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                    Current Role
                  </label>
                </div>
                <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                  {ROLE_DESCRIPTIONS[profile.role]}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="cursor-default">
                  <Shield className="h-3 w-3 mr-1" />
                  {ROLE_LABELS[profile.role]}
                </Badge>
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-4 right-4 h-px bg-border/50"
              />
            </li>

            {/* Verification Status */}
            {verificationStatus && (
              <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                    Verification Status
                  </label>
                  <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                    {verificationStatus === 'PENDING' &&
                      'Your documents are being reviewed'}
                    {verificationStatus === 'VERIFIED' &&
                      'You can create and list deals'}
                    {verificationStatus === 'REJECTED' &&
                      'Please update your documents and resubmit'}
                    {verificationStatus === 'CANCELLED' &&
                      'Application was cancelled'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                      VERIFICATION_STATUS_CONFIG[verificationStatus].bgColor
                    } ${VERIFICATION_STATUS_CONFIG[verificationStatus].borderColor}`}
                  >
                    {StatusIcon && (
                      <StatusIcon
                        className={`h-3.5 w-3.5 ${VERIFICATION_STATUS_CONFIG[verificationStatus].color}`}
                      />
                    )}
                    <span
                      className={`text-xs font-medium ${VERIFICATION_STATUS_CONFIG[verificationStatus].color}`}
                    >
                      {VERIFICATION_STATUS_CONFIG[verificationStatus].label}
                    </span>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-4 right-4 h-px bg-border/50"
                />
              </li>
            )}

            {/* Apply to become a Sourcer (Investors without pending application) */}
            {canApply && (
              <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                    Become a Sourcer
                  </label>
                  <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                    {hasCancelledApplication
                      ? 'Your previous application was cancelled. You can apply again.'
                      : hasRejectedApplication
                      ? 'Your application was rejected. Please update your documents and resubmit.'
                      : 'Start listing deals and earning sourcing fees'}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowApplicationModal(true)}
                    className="cursor-pointer"
                  >
                    {hasCancelledApplication || hasRejectedApplication ? 'Apply Again' : 'Apply Now'}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </li>
            )}

            {/* Cancel Pending Application (Investors with pending application) */}
            {hasPendingApplication && (
              <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                    Application Actions
                  </label>
                  <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                    Your application is under review. You can cancel it anytime.
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                    className="cursor-pointer text-destructive hover:text-destructive"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5 mr-1.5" />
                        Cancel Application
                      </>
                    )}
                  </Button>
                </div>
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Application Modal */}
      <SourcerApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
      />

      {/* Cancel Application Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sourcer Application</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to cancel your sourcer application? This action will:
              </p>

              <ul className="list-disc list-inside text-sm space-y-1.5 ml-2">
                <li>Cancel your pending verification</li>
                <li>Remove all uploaded KYC documents</li>
                <li>Clear your company and bio information</li>
                <li>Mark your application as cancelled</li>
              </ul>

              <p className="text-xs text-muted-foreground font-medium">
                You can reapply anytime by submitting a new application.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isCancelling}>
              Keep Application
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelApplication}
              disabled={isCancelling}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Application'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
