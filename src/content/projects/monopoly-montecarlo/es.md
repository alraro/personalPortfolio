---
title: Monopoly Monte Carlo
subtitle: Una simulación Monte Carlo multihilo del Monopoly en C++ que cuenta dónde caen los jugadores.
---

Es una simulación Monte Carlo del Monopoly escrita en C++23. Juega muchas partidas de dados, dobles y cárcel, y registra cuántas veces se cae en cada casilla y cuántas veces va a la cárcel cada jugador.

Se configuran jugadores, casillas, partidas, turnos, semilla e hilos. Los resultados se exportan a CSV por partida, y una interfaz con Dear ImGui muestra el progreso. Modela solo el movimiento: la estrategia nunca compra propiedades, así que el dinero queda fuera.

Las partidas se reparten entre hilos con un contador de progreso atómico y una señal de parada. Cada partida usa la semilla base más su identificador, así que las ejecuciones son reproducibles. Un script de benchmark recorre números de turnos e hilos, y un análisis con `perf` me llevó a sustituir operaciones de módulo en el bucle caliente.

Me mostró cuánto puede importar un cambio pequeño en un bucle caliente.
