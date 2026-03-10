import { useState } from 'react';
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

export default function SettingsPage() {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Hard-coded data (will be replaced with real data later)
  const profileData = {
    name: 'Sandesh Shrestha',
    email: 'yoursandeshgeneral@gmail.com',
    memberSince: '24/02/2026',
    connectedAccount: {
      provider: 'Google',
      connectedDate: '24/02/2026',
      username: '@yoursandeshgeneral',
    },
  };

  const handleSignOut = () => {
    // TODO: Implement actual sign out
    console.log('Sign out requested');
    setShowSignOutDialog(false);
    alert('Sign out is not implemented yet');
  };

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
                    <span className="text-[13px] text-foreground">{profileData.name}</span>
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
                    <span className="text-[13px] text-muted-foreground">{profileData.email}</span>
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
                    <span className="text-[13px] text-muted-foreground">{profileData.memberSince}</span>
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
                        {profileData.connectedAccount.provider}
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      Connected {profileData.connectedAccount.connectedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[13px] text-muted-foreground">
                      {profileData.connectedAccount.username}
                    </span>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Session Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">Session</h3>
              <p className="text-xs text-muted-foreground">Manage your current session</p>
            </div>
            <section className="rounded-[7px] bg-card border border-border">
              <ul className="min-w-0 min-h-0">
                <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                        Sign Out
                      </label>
                    </div>
                    <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                      End your current session on this device
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowSignOutDialog(true)}
                      className="cursor-pointer text-white h-6 gap-1 px-2 py-1 text-xs"
                    >
                      <img src="/icons/logout.svg" alt="" className="size-3.5 brightness-0 invert" />
                      Sign Out
                    </Button>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
