import { useEffect, useState, type CSSProperties } from 'react';
import Dither from './reactbits/Dither';
import FaultyTerminal from './reactbits/FaultyTerminal';
import DecryptedText from './reactbits/DecryptedText';
import SplitText from './reactbits/SplitText';
import BlurText from './reactbits/BlurText';
import { VARIANTS, type Theme, type VariantId } from './variants';

const NAME = 'Alfonso Ramos Rojas';
const HEADLINE = 'Software engineering student · Systems & DevOps';
const LINE =
  'Research assistant at Mobilenet (University of Málaga) · Student at 42 Málaga';

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

export default function Hero({ variant }: { variant: VariantId }) {
  const v = VARIANTS[variant];
  const [theme, setTheme] = useState<Theme>('dark');
  const p = theme === 'dark' ? v.dark : v.light;

  useEffect(() => {
    document.documentElement.style.background = p.bg;
    document.documentElement.style.colorScheme = theme;
  }, [p.bg, theme]);

  const name =
    variant === 'a' ? (
      <DecryptedText text={NAME} animateOn="view" sequential speed={40} />
    ) : variant === 'c' ? (
      <BlurText text={NAME} animateBy="words" delay={120} />
    ) : (
      NAME
    );

  const headline =
    variant === 'b' ? (
      <SplitText
        text={HEADLINE}
        tag="span"
        splitType="words"
        delay={40}
        trigger="load"
      />
    ) : (
      HEADLINE
    );

  const gridLines: CSSProperties =
    variant === 'c'
      ? {
          backgroundImage: `linear-gradient(${p.accent}22 1px, transparent 1px), linear-gradient(90deg, ${p.accent}22 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }
      : {};

  return (
    <div
      style={{ background: p.bg, color: p.fg, fontFamily: v.body }}
      className="relative min-h-screen overflow-hidden"
    >
      <div
        key={theme}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: variant === 'a' ? 0.14 : 0.18, ...gridLines }}
      >
        {variant === 'a' && (
          <Dither
            waveColor={p.accent}
            backgroundColor={p.bg}
            enableMouseInteraction={false}
            colorNum={2}
            pixelSize={3}
            waveSpeed={0.02}
          />
        )}
        {variant === 'b' && (
          <FaultyTerminal
            tint={p.accent}
            lightMode={theme === 'light'}
            mouseReact={false}
            brightness={0.6}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{ fontFamily: v.mono, borderColor: p.accent, color: p.accent }}
        className="absolute top-5 right-5 z-10 border px-3 py-1.5 text-xs uppercase"
      >
        {theme === 'dark' ? 'Light' : 'Dark'} mode
      </button>

      <main className="relative z-10 mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-6 py-24 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-5">
          <p
            style={{ fontFamily: v.mono, color: p.accent }}
            className="text-sm"
          >
            {'> hero-' + variant}
          </p>
          <h1
            style={{ fontFamily: v.display }}
            className="text-5xl leading-tight font-semibold md:text-7xl"
          >
            {name}
          </h1>
          <h2
            style={{ color: p.accent, fontFamily: v.mono }}
            className="text-lg md:text-xl"
          >
            {headline}
          </h2>
          <p style={{ color: p.muted }} className="max-w-xl text-base">
            {LINE}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {['GitHub', 'LinkedIn', 'Email'].map((label) => (
              <a
                key={label}
                href="#"
                style={{
                  fontFamily: v.mono,
                  borderColor: p.accent,
                  color: p.accent,
                }}
                className="border px-4 py-2 text-sm hover:opacity-70"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div
          className="relative size-56 overflow-hidden md:size-72"
          style={{
            background: p.accent,
            outline: `1px solid ${p.accent}`,
            outlineOffset: 6,
          }}
        >
          <img
            src="/prototype/owner.jpg"
            alt="Alfonso Ramos Rojas"
            className="size-full object-cover"
            style={{
              filter: 'grayscale(1) contrast(1.25)',
              mixBlendMode: 'multiply',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: GRAIN,
              mixBlendMode: 'overlay',
              opacity: 0.6,
            }}
          />
        </div>
      </main>

      <aside
        style={{
          fontFamily: v.mono,
          background: p.bg,
          borderColor: p.muted,
          color: p.muted,
        }}
        className="fixed bottom-3 left-3 z-20 max-w-xs border p-3 text-[11px] leading-relaxed"
      >
        <div>Fonts: {v.fontsLabel}</div>
        <div>
          Accent: {v.dark.accent} (dark) / {v.light.accent} (light)
        </div>
        <div>Background: {v.background}</div>
        <div>Text effect: {v.textEffect}</div>
      </aside>
    </div>
  );
}
