import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/date';
import { StripeConnectOnboarding } from '@/components/stripe/StripeConnectOnboarding';
import { Loader2, X } from 'lucide-react';

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
      <div className="p-6 space-y-6">
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
      {showDeleteDialog && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
            onClick={() => !deleting && setShowDeleteDialog(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-card rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Delete Account</h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={() => !deleting && setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer shrink-0 ml-4 disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-900 text-sm mb-2">
                    All of your data will be permanently deleted, including:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-red-800 ml-2">
                    <li>Your profile information</li>
                    <li>All investment history and deals</li>
                    <li>Messages and communications</li>
                    <li>Account settings and preferences</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-4 border-t">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border bg-background hover:bg-accent text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete My Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
