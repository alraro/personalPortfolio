import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { canRunDither } from './renderer';
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

type Phase = 'pending' | 'active' | 'skipped';

/**
 * Decides when the Dither may start: after the window `load` event and then
 * a main-thread idle moment (so it never competes with LCP/TBT), and only on
 * a device with hardware WebGL2 (a software renderer would burn the CPU).
 */
function useDitherPhase(enabled: boolean): Phase {
  const [phase, setPhase] = useState<Phase>('pending');
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let idleId = 0;
    const start = () => {
      if (!cancelled) setPhase(canRunDither() ? 'active' : 'skipped');
    };
    const onIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(start, { timeout: 3000 });
      } else {
        idleId = window.setTimeout(start, 200);
      }
    };
    if (document.readyState === 'complete') onIdle();
    else window.addEventListener('load', onIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', onIdle);
      if (typeof window.cancelIdleCallback === 'function')
        window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [enabled]);
  return phase;
}

/**
 * Dither background, very low contrast. Mounted only when motion is allowed;
 * Dither itself pauses when off-screen or when the tab is hidden. Colours come
 * from the design tokens and follow theme changes. It also reports the state
 * on the hero root (`data-motion`: what the motion preference allows) and
 * whether the effect really runs (`data-dither`: pending, active or skipped,
 * e.g. skipped without hardware WebGL), the testing hooks.
 */
export default function HeroBackground() {
  const motionAllowed = useMotionAllowed();
  const rootRef = useRef<HTMLDivElement>(null);
  const phase = useDitherPhase(motionAllowed);
  const [colors, setColors] = useState<Colors | null>(null);

  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>('[data-hero]');
    if (root) root.dataset.motion = motionAllowed ? 'animated' : 'static';
  }, [motionAllowed]);

  useEffect(() => {
    const root = rootRef.current?.closest<HTMLElement>('[data-hero]');
    if (root) root.dataset.dither = phase;
  }, [phase]);

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
      {motionAllowed && phase === 'active' && colors && (
        <Suspense fallback={null}>
          <Dither
            key={`${colors.accent}${colors.background}`}
            waveColor={colors.accent}
            backgroundColor={colors.background}
            enableMouseInteraction={false}
            colorNum={2}
            pixelSize={3}
            waveSpeed={0.02}
            dpr={1}
            maxFps={30}
          />
        </Suspense>
      )}
    </div>
  );
}
