interface DotsPatternProps {
  opacity?: number;
  className?: string;
}

export default function DotsPattern({ opacity = 20, className = '' }: DotsPatternProps) {
  const opacityClass = `opacity-${opacity}`;

  return (
    <div
      className={`absolute inset-0 bg-dots-pattern ${opacityClass} ${className}`}
    />
  );
}
