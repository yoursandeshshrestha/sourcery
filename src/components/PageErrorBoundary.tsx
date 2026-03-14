import { ErrorBoundary, RouteErrorFallback } from './ErrorBoundary';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Page-level Error Boundary
 * Wraps individual pages/routes to catch errors without affecting the entire app
 */
export function PageErrorBoundary({ children }: PageErrorBoundaryProps) {
  return <ErrorBoundary fallback={RouteErrorFallback}>{children}</ErrorBoundary>;
}
