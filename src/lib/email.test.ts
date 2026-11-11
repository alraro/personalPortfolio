import { describe, expect, it } from 'vitest';
import { decodeEmail, encodeEmail } from './email';

describe('email obfuscation', () => {
  it('round-trips an address', () => {
    const address = 'hello@alfonsoramos.dev';
    expect(decodeEmail(encodeEmail(address))).toBe(address);
  });
  it('round-trips non-ASCII input', () => {
    expect(decodeEmail(encodeEmail('ñandú@example.org'))).toBe(
      'ñandú@example.org',
    );
  });
  it('does not leave the address readable', () => {
    const encoded = encodeEmail('hello@alfonsoramos.dev');
    expect(encoded).not.toContain('alfonsoramos');
    expect(encoded).not.toContain('@');
  });
  it('encodes to a known value (reversed string, then base64)', () => {
    expect(encodeEmail('ab@c.d')).toBe('ZC5jQGJh');
  });
});
