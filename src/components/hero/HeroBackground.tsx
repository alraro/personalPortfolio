import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useMotionAllowed } from './useMotionAllowed';

// Loaded only when motion is allowed (no WebGL code for reduced motion).
const Dither = lazy(() => import('./Dither'));

interface Colors {
  accent: string;
  background: string;
}

function readColors(): Colors {
  const style = getComputedStyle(document.documentElement);
  return {
    accent: style.getPropertyValue('--color-accent').trim(),
    background: style.getPropertyValue('--color-background').trim(),
  };
}

/**
 * Dither background, very low contrast. Mounted only when motion is allowed;
 * Dither itself pauses when off-screen or when the tab is hidden. Colours come
 * from the design tokens and follow theme changes. It also reports the state
 * on the hero root (`data-motion`), the testing hook.
 */
export default function HeroBackground() {
  const motionAllowed = useMotionAllowed();
  const rootRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<Colors | null>(null);

  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>('[data-hero]');
    if (root) root.dataset.motion = motionAllowed ? 'animated' : 'static';
  }, [motionAllowed]);

  useEffect(() => {
    setColors(readColors());
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {motionAllowed && colors && (
        <Suspense fallback={null}>
          <Dither
            key={`${colors.accent}${colors.background}`}
            waveColor={colors.accent}
            backgroundColor={colors.background}
            enableMouseInteraction={false}
            colorNum={2}
            pixelSize={3}
            waveSpeed={0.02}
          />
        </Suspense>
      )}
    </div>
  );
}
