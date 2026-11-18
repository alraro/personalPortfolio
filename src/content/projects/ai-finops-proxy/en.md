---
title: AI FinOps Proxy
subtitle: A proxy that sends each prompt to the cheapest AI model able to handle it and keeps spending in check per team.
mediaAlt: AI FinOps Proxy dashboard showing total spend, tokens used, a donut chart of spend per group and each team's remaining budget.
---

AI FinOps Proxy sits between a company's teams and its generative AI providers. Four of us built it at the Mercedes-Benz FinOps hackathon at the University of Málaga's computer science school, where we took second place.

Every prompt goes through a three-layer cascade router: free rules over seven dimensions, then a KNN search over embeddings and, if it is still unclear, a safe escalation. A personal-data detector keeps those prompts away from cloud models. The proxy records tokens and cost per team, warns at 80 % of the budget, blocks with a 429 at 100 % and forecasts month-end spend. In our evaluation it picked the right route 97.4 % of the time and resolved 79.5 % of prompts at zero cost.

I built the load simulator, connected the backend to the database, and designed and implemented the complexity classifier: the rules layer and the 7-nearest-neighbour embeddings layer.
