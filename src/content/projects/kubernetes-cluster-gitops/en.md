---
title: Kubernetes Cluster GitOps
subtitle: A home-lab Kubernetes cluster managed entirely through GitOps with ArgoCD.
---

This is my personal Kubernetes home lab, where every change to the cluster is a commit. It currently runs on Oracle Cloud's Free Tier.

ArgoCD watches the repository using the app-of-apps pattern: one root application points at a set of tracker definitions, and each tracker syncs its own manifests. The cluster runs cert-manager, Sealed Secrets, Traefik ingress, Grafana and a modded Minecraft server.

TLS certificates come from Let's Encrypt through Cloudflare DNS-01 challenges, and secrets are committed encrypted with Sealed Secrets. The Minecraft server is scaled to zero replicas by default, so it costs nothing when nobody is playing. Nothing ties the setup to one provider, and the README lists what to change to run it elsewhere.

It taught me to treat the repository as the single source of truth for a cluster, secrets included.
