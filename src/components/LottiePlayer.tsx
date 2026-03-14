import { useEffect, useRef } from 'react';

interface LottiePlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

export function LottiePlayer({ src, autoplay = true, loop = false, className = '' }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: any;

    const loadAnimation = async () => {
      try {
        // Dynamically import lottie-web
        const lottie = await import('lottie-web');

        if (containerRef.current) {
          animation = lottie.default.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            path: src,
          });
        }
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    };

    loadAnimation();

    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, [src, autoplay, loop]);

  return <div ref={containerRef} className={className} />;
}
