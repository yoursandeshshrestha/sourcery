interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Loading...',
  fullScreen = false
}: LoadingSpinnerProps) {
  const content = (
    <div className="text-center">
      <div className="w-8 h-8 border-3 border-[#E9E6DF] border-t-[#1A2208] rounded-full animate-spin mx-auto"></div>
      {message && (
        <p className="mt-3 text-sm text-[#5C5C49]">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED]">
        {content}
      </div>
    );
  }

  return content;
}
