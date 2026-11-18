---
title: UNHEAT Project
subtitle: Maps the burned area and active fire fronts of a wildfire from Sentinel-2 satellite imagery.
mediaAlt: UNHEAT map over a satellite image of a wildfire, with the burned area in maroon and orange, the perimeter in blue and active fires marked with triangles.
---

UNHEAT is our answer to Indra's challenge at the third Malackathon at the University of Málaga, where we were one of three finalist teams out of thirteen. From the SWIR, True Color and Wildfires composites exported by Copernicus Browser, it builds an operational map of the fire in seconds, with a web app, an API and a CLI.

The engine computes NBR on the SWIR composite and separates the burned area with a Multi-Otsu threshold fitted to each scene. It then rejects smoke, clouds, water and shadow by comparing against True Color, and decodes active fires from the Wildfires composite. Given a coordinate bounding box, it reports hectares, perimeters and distance-based alerts for nearby towns. With no ground truth available, it is validated with self-consistency metrics.

I built the engine skeleton and its JSON contract, burned-area detection, false-positive rejection, validation, georeferencing and the final web interface.
