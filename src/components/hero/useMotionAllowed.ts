import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True once mounted in a browser that does not ask for reduced motion.
 * Starts false so server HTML and first client render are identical, and
 * follows live changes of the preference.
 */
export function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setAllowed(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return allowed;
}
