import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
import { formatDate } from '@/lib/date';

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      if (!user) return;

      // Call the database function to delete the account
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      // Sign out and redirect
      await signOut();
      setShowDeleteDialog(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
      setShowDeleteDialog(false);
    }
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'User';
  const email = user?.email || '';
  const memberSince = profile?.created_at ? formatDate(profile.created_at) : '';
  const connectedDate = user?.created_at ? formatDate(user.created_at) : '';

  return (
    <div className="px-6 py-8 mx-auto w-full max-w-6xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <div className="space-y-8">
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="cursor-pointer text-white h-7 gap-1.5 px-3 py-1 text-xs"
                    >
                      Delete Account
                    </Button>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <p className="font-medium text-destructive">All of your data will be permanently deleted, including:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Your profile information</li>
                <li>All investment history and deals</li>
                <li>Messages and communications</li>
                <li>Account settings and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
