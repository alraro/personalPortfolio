---
title: Kubernetes Cluster GitOps
subtitle: Un clúster de Kubernetes de laboratorio casero gestionado por completo con GitOps y ArgoCD.
---

Este es mi laboratorio personal de Kubernetes, donde cada cambio en el clúster es un commit. Ahora mismo corre en el nivel gratuito de Oracle Cloud.

ArgoCD vigila el repositorio con el patrón app-of-apps: una aplicación raíz apunta a un conjunto de definiciones de seguimiento, y cada una sincroniza sus propios manifiestos. El clúster ejecuta cert-manager, Sealed Secrets, el ingress de Traefik, Grafana y un servidor de Minecraft con mods.

Los certificados TLS vienen de Let's Encrypt mediante desafíos DNS-01 con Cloudflare, y los secretos se guardan cifrados en el repositorio con Sealed Secrets. El servidor de Minecraft está escalado a cero réplicas por defecto, así que no cuesta nada cuando nadie juega. Nada ata la configuración a un proveedor concreto, y el README indica qué cambiar para ejecutarla en otro sitio.

Me enseñó a tratar el repositorio como la única fuente de verdad de un clúster, secretos incluidos.
