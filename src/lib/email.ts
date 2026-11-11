/**
 * Email obfuscation: the address is stored as base64 of the reversed string,
 * so it never appears as plain text in the built HTML. A small client script
 * decodes it. Pure functions; they work in Node and in the browser.
 */

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeEmail(address: string): string {
  return toBase64([...address].reverse().join(''));
}

export function decodeEmail(encoded: string): string {
  return [...fromBase64(encoded)].reverse().join('');
}
