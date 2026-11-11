// Lighthouse CI config. Run once per preset:
//   AUDIT_PRESET=mobile  lhci autorun   (Lighthouse default emulation)
//   AUDIT_PRESET=desktop lhci autorun
const preset = process.env.AUDIT_PRESET === 'desktop' ? 'desktop' : 'mobile';

// URLs to audit, relative to the static build in dist/.
// Edit here. '/' is only a redirect page, so the real homes are audited.
const urls = ['/en/', '/es/'];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: urls,
      numberOfRuns: 3,
      // Mobile is Lighthouse's default, so only desktop needs a preset.
      settings: preset === 'desktop' ? { preset: 'desktop' } : {},
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `./lhci-reports/${preset}`,
    },
  },
};
