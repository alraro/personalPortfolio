import { lazy, Suspense } from 'react';
import { useMotionAllowed } from './useMotionAllowed';

// Loaded only when motion is allowed, so reduced-motion visitors never fetch it.
const DecryptedText = lazy(() => import('./DecryptedText'));

/**
 * The name as real text first (server HTML, and always under reduced motion).
 * Once hydrated, and only if motion is allowed, the text effect takes over.
 */
export default function HeroName({ name }: { name: string }) {
  const motionAllowed = useMotionAllowed();
  if (!motionAllowed) return <>{name}</>;
  return (
    <Suspense fallback={name}>
      <DecryptedText text={name} animateOn="view" sequential speed={40} />
    </Suspense>
  );
}
