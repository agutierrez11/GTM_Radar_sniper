# GTM Radar Sniper - Setup Instructions

## 📦 Descargaste el Proyecto Rediseñado

Este es el proyecto **GTM Radar Sniper** completamente rediseñado con estética SaaS profesional (inspirado en Linear, Vercel, Stripe).

---

## 🚀 Quick Start (5 minutos)

### 1. Instalar Dependencias
```bash
cd gtm-radar-redesign
pnpm install
```

### 2. Ejecutar en Desarrollo
```bash
pnpm dev
```

### 3. Abrir en Navegador
```
http://localhost:3000
```

---

## 📋 Qué Incluye Este Proyecto

### ✅ Frontend Rediseñado
- **Sidebar**: Navegación limpia con íconos SVG
- **Topbar**: Logo + badge "Live" + search + avatar
- **Metric Cards**: Fondo blanco, borde 0.5px, acento azul 3px
- **Tabla de Leads**: Badges de color, barras de progreso
- **Tipografía**: Inter 400/500, sin MAYÚSCULAS militares
- **Paleta**: Blanco, grises suaves, azul #378ADD

### 📄 Documentación
- `REDESIGN_SUMMARY.md` - Análisis antes/después
- `ANALYSIS.md` - Análisis del sitio original
- `SETUP_INSTRUCTIONS.md` - Este archivo

### 🔧 Estructura
```
gtm-radar-redesign/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   └── ui/ (shadcn/ui components)
│   │   ├── pages/
│   │   │   ├── Home.tsx (Dashboard principal)
│   │   │   └── NotFound.tsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css (Paleta de colores SaaS)
│   ├── public/
│   ├── index.html
│   └── package.json
├── server/
│   └── index.ts (Express server)
├── shared/
│   └── const.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎨 Cambios Principales

### Antes (Sitio Original)
- ❌ Fondo negro militar (#0a0e27)
- ❌ Colores saturados (rojo, amarillo, cian)
- ❌ Tipografía monoespaciada
- ❌ MAYÚSCULAS excesivas
- ❌ Bordes dashed confusos
- ❌ Tabla amontonada sin estructura

### Después (Rediseño)
- ✅ Fondo blanco/gris claro
- ✅ Paleta SaaS profesional (azul #378ADD)
- ✅ Tipografía Inter 400/500
- ✅ Mayúsculas solo donde corresponde
- ✅ Bordes 0.5px sutiles
- ✅ Tabla limpia con badges y barras de progreso
- ✅ Sidebar + Topbar profesionales
- ✅ Metric cards con acento lateral

---

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (si necesitas):

```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=GTM Radar Sniper
```

### Desarrollo
```bash
# Instalar dependencias
pnpm install

# Ejecutar dev server
pnpm dev

# Build para producción
pnpm build

# Preview de build
pnpm preview

# Type checking
pnpm check
```

---

## 📊 Componentes Principales

### Sidebar (`components/Sidebar.tsx`)
- Logo con gradiente
- Navegación (Dashboard, Targets, Pipeline)
- Estado activo con acento azul
- Settings y Sign out

### Topbar (`components/Topbar.tsx`)
- Logo + nombre de app
- Badge "Live" pulsante
- Search bar
- Notifications bell
- Avatar con iniciales

### MetricCard (`components/MetricCard.tsx`)
- Fondo blanco
- Borde 0.5px
- Acento lateral 3px en azul
- Valor grande (24px/500)
- Subtítulo descriptivo
- Indicador de tendencia

### LeadsTable (`components/LeadsTable.tsx`)
- Tabla limpia
- Badges de color para status
- Barras de progreso para scores
- Hover effects sutiles
- Filas alternadas

---

## 🎯 Próximos Pasos (Opcionales)

### 1. Agregar CrewAI para Análisis Automático
Tengo un prompt listo para integrar análisis IA automático. Contacta si lo necesitas.

### 2. Agregar Vista de Grafo (Tipo Heuristica)
Tengo un prompt listo para agregar visualización de mapas conceptuales. Contacta si lo necesitas.

### 3. Agregar Dark Mode
El proyecto está configurado para light mode. Para agregar dark mode:
1. Cambiar `defaultTheme="light"` a `switchable` en `App.tsx`
2. Usar `useTheme()` hook en componentes

### 4. Agregar Backend
El proyecto incluye estructura para Express, pero está vacía. Para agregar backend:
1. Implementar rutas en `server/index.ts`
2. Conectar base de datos
3. Agregar autenticación

---

## 📱 Responsive Design

El proyecto está optimizado para:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

Usa Tailwind CSS breakpoints:
- `sm:` (640px)
- `md:` (768px)
- `lg:` (1024px)
- `xl:` (1280px)
- `2xl:` (1536px)

---

## 🚀 Deploy

### Opción 1: Manus (Recomendado)
El proyecto fue creado con Manus. Puedes publicarlo directamente desde la plataforma.

### Opción 2: Vercel
```bash
npm install -g vercel
vercel
```

### Opción 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Opción 4: Docker
```bash
docker build -t gtm-radar .
docker run -p 3000:3000 gtm-radar
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
pnpm install
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en vite.config.ts
# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error: "TypeScript errors"
```bash
pnpm check
```

### Estilos no se aplican
- Verificar que `index.css` esté importado en `main.tsx`
- Limpiar caché: `rm -rf .vite dist`
- Reiniciar dev server

---

## 📚 Documentación

### Archivos Importantes
- `REDESIGN_SUMMARY.md` - Análisis completo del rediseño
- `ANALYSIS.md` - Análisis del sitio original
- `client/src/index.css` - Paleta de colores SaaS
- `package.json` - Dependencias del proyecto

### Recursos Externos
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

## 💡 Tips

### 1. Agregar Nuevo Componente
```bash
# Crear archivo en components/
# Importar en donde lo necesites
# Usar shadcn/ui como base si es posible
```

### 2. Agregar Nueva Página
```bash
# Crear archivo en pages/
# Agregar ruta en App.tsx
# Usar layout existente
```

### 3. Cambiar Colores
Editar `client/src/index.css`:
```css
:root {
  --primary: #378ADD; /* Cambiar aquí */
  --background: oklch(1 0 0);
  /* ... */
}
```

### 4. Cambiar Tipografía
Editar `client/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

---

## 📞 Soporte

Si tienes dudas sobre:
- **Rediseño**: Ver `REDESIGN_SUMMARY.md`
- **Componentes**: Ver archivos en `client/src/components/`
- **Estilos**: Ver `client/src/index.css`
- **Estructura**: Ver esta carpeta

---

## 📄 Licencia

Este proyecto es tuyo. Úsalo como quieras.

---

## ✅ Checklist de Verificación

- [ ] Instalé dependencias (`pnpm install`)
- [ ] El dev server corre sin errores (`pnpm dev`)
- [ ] Puedo ver el dashboard en `http://localhost:3000`
- [ ] Los estilos se ven correctamente (blanco, azul, grises)
- [ ] La tabla de leads se ve limpia
- [ ] El sidebar y topbar funcionan
- [ ] Los metric cards se ven profesionales

---

## 🎉 ¡Listo!

Tu proyecto está rediseñado y listo para usar. Ahora puedes:

1. ✅ Personalizar según tus necesidades
2. ✅ Agregar funcionalidades (CrewAI, Graph View, etc.)
3. ✅ Publicar en producción
4. ✅ Compartir con tu equipo

¡Éxito! 🚀
