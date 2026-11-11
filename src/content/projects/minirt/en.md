---
title: miniRT
subtitle: A ray tracer in C that renders 3D scenes from a text description.
mediaAlt: A blue cylinder and a red sphere casting hard shadows on a grey plane, rendered by miniRT.
---

miniRT is the ray tracing project of the 42 curriculum, which I built in C as a team of two. The goal was to implement the core of a ray tracer from scratch, with no graphics library doing the maths.

It reads a `.rt` scene file and renders spheres, planes and cylinders with ambient and diffuse light and hard shadows. The bonus version adds several coloured lights, Phong specular reflection, checker patterns, XPM textures, normal maps, and cones, hyperboloids and paraboloids.

Every object carries a local-to-world transform and its inverse, so intersections are computed in object space while normals stay correct in world space. The bonus renders the image in tiles across 16 worker threads using `pthreads`.

Getting the normals right under transforms was the part that taught me the most about the maths behind rendering.
