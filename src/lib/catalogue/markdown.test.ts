import { describe, expect, it } from 'vitest';
import { renderMarkdown, stripHtmlComments } from './core';

describe('renderMarkdown', () => {
  it('drops a block HTML comment', () => {
    const html = renderMarkdown('<!-- TODO(owner): secret -->\n\nHello.');
    expect(html).not.toContain('<!--');
    expect(html).not.toContain('TODO');
    expect(html).toContain('<p>Hello.</p>');
  });

  it('drops an inline and a multi-line comment', () => {
    const html = renderMarkdown(
      'Hello <!-- a --> there.\n\n<!--\nsecret\n-->\n\nEnd.',
    );
    expect(html).not.toContain('<!--');
    expect(html).not.toContain('secret');
    expect(html).toContain('End.');
  });

  it('keeps a comment shown as code', () => {
    expect(renderMarkdown('`<!-- x -->`')).toContain('&lt;!-- x --&gt;');
  });

  it('returns an empty string for an empty body', () => {
    expect(renderMarkdown('  \n')).toBe('');
  });
});

describe('stripHtmlComments', () => {
  it('removes nested-looking comments completely', () => {
    expect(stripHtmlComments('a<!<!-- x -->-- y -->b')).toBe('ab');
  });
});
