export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'dark' | 'light';

/** Values of the `background` token per theme, used for `<meta name="theme-color">`. */
export const themeColors: Record<Theme, string> = {
  dark: '#0d0c0a',
  light: '#f6efe2',
};

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/** Applies a theme to the document: attribute and theme-color metas. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      meta.content = themeColors[theme];
    });
}
