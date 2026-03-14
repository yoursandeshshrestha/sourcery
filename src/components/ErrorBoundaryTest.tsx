import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * Test component for Error Boundaries
 *
 * USAGE:
 * 1. Import this component in any page
 * 2. Wrap it with ErrorBoundary or PageErrorBoundary
 * 3. Click the buttons to test different error scenarios
 *
 * Example:
 * <PageErrorBoundary>
 *   <ErrorBoundaryTest />
 * </PageErrorBoundary>
 *
 * NOTE: This is a development/testing component.
 * Remove from production builds or hide behind DEV check.
 */
export function ErrorBoundaryTest() {
  const [throwError, setThrowError] = useState(false);
  const [throwAsyncError, setThrowAsyncError] = useState(false);

  // Synchronous error - WILL be caught by error boundary
  if (throwError) {
    throw new Error('Test Error: Synchronous error thrown during render');
  }

  // Asynchronous error - will NOT be caught by error boundary
  const handleAsyncError = async () => {
    setThrowAsyncError(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('Test Error: Async error (not caught by error boundary)');
  };

  // Event handler error - will NOT be caught by error boundary
  const handleEventError = () => {
    throw new Error('Test Error: Event handler error (not caught by error boundary)');
  };

  return (
    <Card className="max-w-2xl mx-auto border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Error Boundary Test Component</CardTitle>
        </div>
        <CardDescription>
          Test different error scenarios to verify error boundary functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Render Error - Caught by Error Boundary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            1. Render Error (Caught ✅)
          </h3>
          <p className="text-xs text-muted-foreground">
            Throws an error during component render. This WILL be caught by the error boundary.
          </p>
          <Button
            variant="destructive"
            onClick={() => setThrowError(true)}
            className="cursor-pointer"
          >
            Trigger Render Error
          </Button>
        </div>

        {/* Event Handler Error - NOT Caught */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            2. Event Handler Error (Not Caught ❌)
          </h3>
          <p className="text-xs text-muted-foreground">
            Throws an error in a click handler. Error boundaries do NOT catch these.
            Check the browser console.
          </p>
          <Button
            variant="outline"
            onClick={handleEventError}
            className="cursor-pointer border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            Trigger Event Handler Error
          </Button>
        </div>

        {/* Async Error - NOT Caught */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            3. Async Error (Not Caught ❌)
          </h3>
          <p className="text-xs text-muted-foreground">
            Throws an error in async code. Error boundaries do NOT catch these.
            Check the browser console.
          </p>
          <Button
            variant="outline"
            onClick={handleAsyncError}
            disabled={throwAsyncError}
            className="cursor-pointer border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            {throwAsyncError ? 'Error Thrown (check console)' : 'Trigger Async Error'}
          </Button>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-xs font-medium text-foreground">ℹ️ Error Boundary Limitations</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Event handlers: Use try/catch in the handler</li>
            <li>Async code: Use try/catch or .catch()</li>
            <li>Server-side rendering: Different error handling needed</li>
            <li>Errors in the boundary itself: Can't catch its own errors</li>
          </ul>
        </div>

        {/* Development Only Warning */}
        {!import.meta.env.DEV && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-4">
            <p className="text-xs font-medium text-destructive">
              ⚠️ This test component should not be visible in production!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example Usage in a Route:
 *
 * // In App.tsx or any page
 * import { PageErrorBoundary } from '@/components/PageErrorBoundary';
 * import { ErrorBoundaryTest } from '@/components/ErrorBoundaryTest';
 *
 * <Route
 *   path="/test-error-boundary"
 *   element={
 *     <PageErrorBoundary>
 *       <div className="p-8">
 *         <ErrorBoundaryTest />
 *       </div>
 *     </PageErrorBoundary>
 *   }
 * />
 */
