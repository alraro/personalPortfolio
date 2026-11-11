/** True when `href` points to a web origin other than the site's own. */
export function isExternalHref(href: string, site: string): boolean {
  let url: URL;
  try {
    url = new URL(href, site);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return url.origin !== new URL(site).origin;
}
