---
title: miniRT
subtitle: Un ray tracer en C que renderiza escenas 3D a partir de una descripción en texto.
mediaAlt: Un cilindro azul y una esfera roja que proyectan sombras duras sobre un plano gris, renderizados con miniRT.
---

miniRT es el proyecto de ray tracing del currículo de 42, que hice en C en equipo de dos. El objetivo era implementar desde cero el núcleo de un ray tracer, sin bibliotecas gráficas.

Lee un archivo de escena `.rt` y renderiza esferas, planos y cilindros con luz ambiente y difusa y sombras duras. La versión bonus añade varias luces de color, reflexión especular de Phong, patrones de ajedrez, texturas XPM, mapas de normales, y conos, hiperboloides y paraboloides.

Cada objeto lleva su transformación de local a mundo y su inversa, de modo que las intersecciones se calculan en el espacio del objeto y las normales siguen siendo correctas en el espacio del mundo. El bonus renderiza la imagen por teselas repartidas entre 16 hilos de trabajo con `pthreads`.

Acertar con las normales bajo transformaciones fue lo que más me enseñó sobre las matemáticas del renderizado.
