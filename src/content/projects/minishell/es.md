---
title: Minishell
subtitle: Una pequeña shell de Unix escrita desde cero en C para el currículo de 42.
---

Minishell es un proyecto de 42: una shell de Unix hecha desde cero en C en equipo de dos, para entender qué pasa entre escribir un comando y ver su salida.

Ejecuta comandos por ruta o buscándolos en el PATH, y admite pipes y las redirecciones `>`, `<`, `>>` y `<<`. Expande variables de entorno, gestiona comillas simples y dobles, responde a `Ctrl+C`, `Ctrl+D` y `Ctrl+\`, devuelve el estado de salida correcto e implementa los builtins `cd`, `echo`, `pwd`, `export`, `unset`, `env` y `exit`.

Lo interesante está del lado de los procesos: `fork`, `execve`, `wait` y las señales. Los heredocs dentro de un pipeline necesitaron un archivo temporal único por instancia de la shell, una de las últimas correcciones. El repositorio incluye un script de pruebas de sintaxis y una comprobación de fugas.

Aprendí cómo funcionan los procesos en UNIX, a tokenizar y analizar la entrada y a gestionar la memoria con cuidado en C.
