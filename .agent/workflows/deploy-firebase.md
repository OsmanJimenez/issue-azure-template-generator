---
description: Cómo desplegar la aplicación en Firebase Hosting
---

Este workflow describe los pasos para realizar un nuevo despliegue de la aplicación.

// turbo-all
1. Generar el build de producción:
```bash
npm run build -- --configuration production
```

2. Desplegar a Firebase Hosting:
```bash
firebase deploy --only hosting
```

3. Verificar la URL:
`https://azure-issue-gen-4554.web.app`
