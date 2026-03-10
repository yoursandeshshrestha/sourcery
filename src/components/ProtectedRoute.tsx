interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Array<'employee' | 'dept_head' | 'procurement_manager' | 'finance' | 'store_admin' | 'vendor' | 'super_admin'>;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TODO: Re-enable authentication when done with UI work
  // Temporarily bypassing auth for UI development
  return <>{children}</>;
}
