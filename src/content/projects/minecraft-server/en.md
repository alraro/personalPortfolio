---
title: Minecraft server
subtitle: A modded server for friends, with metrics, logs and backups set up with Docker Compose.
---

A NeoForge Minecraft server I set up and ran for playing with friends. Docker Compose brings it up alongside Prometheus and Grafana for metrics, and Loki and Promtail for logs.

The modpack is managed with packwiz and the server pulls it on start. Scripts handle backups, RCON, restarts and spotting banned mods in the logs. The same server later moved into my Kubernetes cluster.

I built it on my own: it is where I learned to operate a service other people use every day.
