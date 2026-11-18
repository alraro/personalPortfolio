---
title: UNHEAT Project
subtitle: Detecta superficie quemada y focos activos de un incendio en imágenes del satélite Sentinel-2.
mediaAlt: Mapa de UNHEAT sobre una imagen de satélite de un incendio, con la superficie quemada en granate, el perímetro en azul y los focos activos en triángulos.
---

UNHEAT es nuestra respuesta al reto de Indra en la III Malackathon de la UMA, donde fuimos uno de los tres equipos finalistas de trece. A partir de las composiciones SWIR, True Color y Wildfires que exporta Copernicus Browser, genera en segundos un mapa operativo del incendio, con web, API y CLI.

El motor calcula el NBR en la composición SWIR y separa la superficie quemada con un umbral Multi-Otsu ajustado a cada escena. Después descarta humo, nubes, agua y sombras comparando con True Color y decodifica los focos activos de la composición Wildfires. Con un recuadro de coordenadas calcula hectáreas, perímetros y alertas por distancia a las poblaciones cercanas. Como no hay datos de referencia, se valida con métricas de autoconsistencia.

Hice el esqueleto del motor y su contrato JSON, la detección de superficie quemada, el descarte de falsos positivos, la validación, el georreferenciado y la interfaz web final.
