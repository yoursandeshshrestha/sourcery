interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({
  message = 'Loading...',
  fullScreen = false,
  size = 'md'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const content = (
    <div className="text-center">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-primary rounded-full animate-spin mx-auto`}></div>
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
