import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/date';
import { StripeConnectOnboarding } from '@/components/stripe/StripeConnectOnboarding';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle Stripe Connect return URLs
  useEffect(() => {
    const stripeStatus = searchParams.get('stripe');

    if (stripeStatus === 'success') {
      toast.success('Stripe onboarding completed successfully!');
      // Refresh profile to get updated stripe status
      refreshProfile();
      // Clean up URL
      searchParams.delete('stripe');
      setSearchParams(searchParams, { replace: true });
    } else if (stripeStatus === 'refresh') {
      toast.info('Please complete your Stripe onboarding');
      // Clean up URL
      searchParams.delete('stripe');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDeleteAccount = async () => {
    try {
      if (!user) return;

      setDeleting(true);

      // Call the database function to delete the account
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error deleting account:', error);
        }
        throw error;
      }

      // Sign out and redirect
      await signOut();
      toast.success('Account deleted successfully');
      navigate('/', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete account:', error);
      }
      toast.error('Failed to delete account. Please try again or contact support.');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'User';
  const email = user?.email || '';
  const memberSince = profile?.created_at ? formatDate(profile.created_at) : '';
  const connectedDate = user?.created_at ? formatDate(user.created_at) : '';

  return (
    <>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">Profile</h3>
              <p className="text-xs text-muted-foreground">Your basic account information</p>
            </div>
            <section className="rounded-[7px] bg-card border border-border">
              <ul className="min-w-0 min-h-0">
                {/* Name */}
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Name
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      Your display name across the platform
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[13px] text-foreground">{fullName}</span>
                  </div>
                  <div aria-hidden="true" className="absolute bottom-0 left-4 right-4 h-px bg-border/50" />
                </li>

                {/* Email */}
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Email
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      Your account email address
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[13px] text-muted-foreground">{email}</span>
                  </div>
                  <div aria-hidden="true" className="absolute bottom-0 left-4 right-4 h-px bg-border/50" />
                </li>

                {/* Member Since */}
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Member Since
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      When you joined the platform
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[13px] text-muted-foreground">{memberSince}</span>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Connected Accounts Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">Connected Accounts</h3>
              <p className="text-xs text-muted-foreground">Manage how you sign in to your account</p>
            </div>
            <section className="rounded-[7px] bg-card border border-border">
              <ul className="min-w-0 min-h-0">
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Google
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      Connected {connectedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[13px] text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Stripe Connect Section - Only for Sourcers */}
          {profile?.role === 'SOURCER' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">Payment Settings</h3>
                <p className="text-xs text-muted-foreground">Manage your payout account</p>
              </div>
              <StripeConnectOnboarding />
            </div>
          )}

          {/* Danger Zone Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[15px] font-[450] leading-[23px] text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Irreversible actions</p>
            </div>
            <section className="rounded-[7px] bg-card border border-border">
              <ul className="min-w-0 min-h-0">
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Delete Account
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      Permanently delete your account and all associated data
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-7 px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All of your data will be permanently deleted, including:
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>Your profile information</li>
                <li>All investment history and deals</li>
                <li>Messages and communications</li>
                <li>Account settings and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
              className="cursor-pointer rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-lg"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
