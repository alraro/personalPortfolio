---
title: AI FinOps Proxy
subtitle: Un proxy que envía cada prompt al modelo de IA más barato capaz de resolverlo y controla el gasto por equipo.
mediaAlt: Dashboard de AI FinOps Proxy con el gasto total, los tokens consumidos, un gráfico circular de consumo por grupo y el presupuesto restante de cada equipo.
---

AI FinOps Proxy se coloca entre los equipos de una empresa y sus proveedores de IA generativa. Lo construimos cuatro personas en el hackathon FinOps de Mercedes-Benz en la ETSI Informática de la UMA, donde quedamos segundos.

Cada prompt pasa por un router en cascada de tres capas: reglas sobre siete dimensiones que no cuestan nada, después una búsqueda KNN sobre embeddings y, si sigue habiendo dudas, un escalado seguro. Un detector de datos personales impide que esos prompts salgan a la nube. El proxy registra tokens y coste por equipo, avisa al llegar al 80 % del presupuesto, bloquea con un 429 al 100 % y proyecta el gasto de fin de mes. En nuestra evaluación acertó la ruta en el 97,4 % de los casos y resolvió el 79,5 % a coste cero.

Yo hice el simulador de carga, conecté el backend a la base de datos y diseñé e implementé el clasificador por complejidad: la capa de reglas y la capa de embeddings con KNN de 7 vecinos.
