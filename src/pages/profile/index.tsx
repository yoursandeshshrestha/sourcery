import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BasicInfoSection } from './components/BasicInfoSection';
import { RoleSection } from './components/RoleSection';

export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="px-6 py-8 mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 mx-auto w-full max-w-6xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and verification
        </p>
      </div>

      {/* Profile Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <BasicInfoSection />

        {/* Role & Application/Verification Status */}
        <RoleSection />
      </div>
    </div>
  );
}
