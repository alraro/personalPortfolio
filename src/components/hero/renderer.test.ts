import { describe, expect, it } from 'vitest';
import { isSoftwareRenderer, minFrameGapMs } from './renderer';

describe('isSoftwareRenderer', () => {
  it.each([
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Mesa Software Rasterizer',
    'Microsoft Basic Render Driver',
    'Google SwiftShader',
  ])('detects the software renderer %s', (name) => {
    expect(isSoftwareRenderer(name)).toBe(true);
  });

  it.each([
    'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Mali-G78',
    'Adreno (TM) 650',
  ])('accepts the hardware renderer %s', (name) => {
    expect(isSoftwareRenderer(name)).toBe(false);
  });

  it('treats an unknown renderer as hardware (the extension may be masked)', () => {
    expect(isSoftwareRenderer(null)).toBe(false);
    expect(isSoftwareRenderer('')).toBe(false);
  });
});

describe('minFrameGapMs', () => {
  it('converts a frame rate to a gap in milliseconds', () => {
    expect(minFrameGapMs(30)).toBeCloseTo(1000 / 30);
  });

  it('is 0 (uncapped) for a missing or non-positive rate', () => {
    expect(minFrameGapMs(undefined)).toBe(0);
    expect(minFrameGapMs(0)).toBe(0);
    expect(minFrameGapMs(-5)).toBe(0);
  });
});
