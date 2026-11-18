---
title: Servidor de Minecraft
subtitle: Un servidor con mods para amigos, con métricas, logs y backups montados con Docker Compose.
---

Un servidor de Minecraft con NeoForge que monté y mantuve para jugar con amigos. Lo levanta Docker Compose junto a Prometheus y Grafana para las métricas y Loki y Promtail para los logs.

El modpack se gestiona con packwiz y el servidor lo descarga al arrancar. Hay scripts para backups, RCON, reinicios y para detectar mods prohibidos en los logs. Más tarde el mismo servidor pasó a mi clúster de Kubernetes.

Lo hice yo solo: es donde aprendí a operar un servicio que otras personas usan cada día.
