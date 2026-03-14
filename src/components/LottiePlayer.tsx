import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';

interface LottiePlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

export function LottiePlayer({ src, autoplay = true, loop = false, className = '' }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        // Dynamically import lottie-web
        const lottie = await import('lottie-web');

        if (containerRef.current) {
          // Destroy existing animation if any
          if (animationRef.current) {
            animationRef.current.destroy();
            animationRef.current = null;
          }

          // Clear any existing content in the container
          containerRef.current.innerHTML = '';

          animationRef.current = lottie.default.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            path: src,
          });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to load Lottie animation:', error);
        }
      }
    };

    loadAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [src, autoplay, loop]);

  return <div ref={containerRef} className={className} />;
}
