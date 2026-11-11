import { describe, expect, it } from 'vitest';
import { getCv } from './cv';

describe('getCv', () => {
  it('returns null when there are no files', () => {
    expect(getCv('en', [])).toBeNull();
    expect(getCv('es', [])).toBeNull();
  });
  it('returns the URL only for the locale that has a file', () => {
    const files = ['cv-en.pdf'];
    expect(getCv('en', files)).toBe('/cv/cv-en.pdf');
    expect(getCv('es', files)).toBeNull();
  });
  it('returns both URLs when both files exist', () => {
    const files = ['cv-es.pdf', 'cv-en.pdf'];
    expect(getCv('en', files)).toBe('/cv/cv-en.pdf');
    expect(getCv('es', files)).toBe('/cv/cv-es.pdf');
  });
  it('ignores other files such as .gitkeep or misnamed CVs', () => {
    expect(getCv('en', ['.gitkeep', 'CV-en.pdf', 'cv-en.pdf.txt'])).toBeNull();
  });
});
