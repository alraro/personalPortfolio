---
title: Monopoly Monte Carlo
subtitle: A multithreaded Monte Carlo simulation of Monopoly in C++ that counts where players land.
---

This is a Monte Carlo simulation of Monopoly written in C++23. It plays many games of dice, doubles and jail, and records how often each square is landed on and how often each player is jailed.

Players, squares, games, turns, seed and thread count are configurable. Results are exported to CSV per game, and a Dear ImGui interface shows progress. It models movement only: the strategy never buys property, so money is out of scope.

Games are split across worker threads with an atomic progress counter and a stop flag. Each game is seeded from the base seed plus its id, so runs are reproducible. A headless build and a benchmark script sweep turn counts and thread counts, and a profiling pass with `perf` led me to replace modulo operations in the hot path.

It showed me how much a small change in a hot loop can matter.
