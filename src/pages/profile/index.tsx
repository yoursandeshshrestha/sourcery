import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BasicInfoSection } from './components/BasicInfoSection';
import { RoleSection } from './components/RoleSection';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      navigate('/');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out:', error);
      }
      setLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
        <div className="space-y-8">
          {/* Basic Information */}
          <BasicInfoSection />

          {/* Role & Application/Verification Status */}
          <RoleSection />

          {/* Account Actions */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Log out of your account on this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={loggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="cursor-pointer"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Log Out'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
