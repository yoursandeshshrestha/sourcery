import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BasicInfoSection } from './components/BasicInfoSection';
import { RoleSection } from './components/RoleSection';
import { LogOut, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out:', error);
      }
      toast.error('Failed to log out. Please try again.');
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
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <BasicInfoSection />

          {/* Role & Application/Verification Status */}
          <RoleSection />

          {/* Account Actions - REMOVED since logout is now in sidebar */}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {logoutDialogOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
            onClick={() => !loggingOut && setLogoutDialogOpen(false)}
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
                  <h2 className="text-xl font-semibold mb-1">Log Out</h2>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to log out?
                  </p>
                </div>
                <button
                  onClick={() => !loggingOut && setLogoutDialogOpen(false)}
                  disabled={loggingOut}
                  className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer shrink-0 ml-4 disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  You'll need to sign in again to access your account.
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-4 border-t">
                <button
                  onClick={() => setLogoutDialogOpen(false)}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 border bg-background hover:bg-accent text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </>
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
