# Estrategia de Sincronización Perpetua: Sniper Factory (GitHub Ready)

Pensando como **Product Owner** (visión) e **Ingeniero** (ejecución), la forma más eficiente de no volver al desorden es implementar una arquitectura de **"Verdad Única"**.

## 1. La Arquitectura de un Solo Repositorio (Monorepo)
Para que no te duelan los "3 o 4 repositorios", consolidaremos todo bajo un solo paraguas jerárquico. Esto permite que cualquier cambio en la base de datos o en el código se refleje inmediatamente en el contexto global.

### Estructura Sugerida del Repositorio
```text
/nexus-poc
  ├── /apps
  │   └── /radar-gtm      # El Dashboard Vercel (Frontend)
  ├── /engine
  │   └── /harvester      # Python v6_stable, scripts de limpieza
  ├── /docs
  │   ├── /manifests      # Manifiestos (Global, PoC, Handover)
  │   └── /dossiers       # Inteligencia Vitrify, Nium, etc.
  ├── /config
  │   └── .env.example    # Plantilla de llaves (seguridad)
  └── README.md           # El Mapa Maestro de entrada
```

## 2. Sincronización en Tiempo Real (Workflows)
Para que los cambios se guarden "solos" y en orden:
- **Git Hooks:** Automatizar que cada vez que se ejecute la cosecha, se actualice un mini-log de progreso en el repositorio.
- **Auto-Manifest Update:** Yo (la IA) tengo el compromiso de actualizar los Manifiestos en `brain/` y en el `/docs/` del repo ante cada hito estratégico.
- **Supabase como Estado Vivo:** El código ya no guarda configuraciones en archivos locales volátiles, todo vive en las tablas de Supabase.

## 3. Separación de Prioridades (Cosma vs. Sniper)
- **Sniper (Radar GTM):** Es el negocio vivo, el SaaS.
- **Cosma/Obsidian:** Es tu base de conocimientos secundaria.
**Acción:** Moveremos Cosma/Obsidian a un repositorio aparte o a una carpeta `_knowledge_base` ignorada por el despliegue del SaaS para no ensuciar el código productivo.

## 4. Próximos Pasos (Ingeniería)
1. **Limpieza de "Grrasa":** Borraremos los 20+ scripts de prueba (`check_v1`, `test_v2`) y dejaremos solo los `_stable`.
2. **Git Init Global:** Inicializaré un nuevo repositorio limpio y moveré las piezas del rompecabezas a la estructura arriba definida.
3. **Github Push:** Subiremos el búnker para que tus futuros desarrolladores solo hagan `git clone` y tengan todo listo.
