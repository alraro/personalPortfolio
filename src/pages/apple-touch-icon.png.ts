import type { APIRoute } from 'astro';
import { renderIconPng } from '../lib/favicon';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await renderIconPng(180)), {
    headers: { 'Content-Type': 'image/png' },
  });
