// Pure helpers plus one browser probe deciding whether the animated Dither
// is worth its cost.

const SOFTWARE = /swiftshader|llvmpipe|software|basic render/i;

/** True when a WebGL renderer string names a CPU (software) rasteriser. */
export function isSoftwareRenderer(name: string | null | undefined): boolean {
  return !!name && SOFTWARE.test(name);
}

/** Minimum gap between frames for a frame-rate cap; 0 means uncapped. */
export function minFrameGapMs(maxFps: number | undefined): number {
  return maxFps && maxFps > 0 ? 1000 / maxFps : 0;
}

/**
 * Probes a throw-away WebGL2 context: false without WebGL2 or when the
 * renderer is software. Such a device would run the shader on the CPU and
 * block the main thread, so the hero stays plain background there.
 */
export function canRunDither(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return false;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : null;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return !isSoftwareRenderer(name);
}
