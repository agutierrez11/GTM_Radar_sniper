# Análisis del Sitio Actual: GTM Radar Sniper

## Estado Actual (Antes del Rediseño)

### Estética Militar/Oscura
- **Fondo**: Negro profundo (#0a0e27 aproximadamente)
- **Tipografía**: Monoespaciada, MAYÚSCULAS excesivas
- **Colores**: Rojo (#ff3333), Amarillo (#ffff00), Cian (#00ffff) - muy saturados
- **Componentes**: Bordes dashed, notación militar (NERV, SNIPER_GTM, LATAM_INTELLIGENCE_GRID)
- **Sidebar**: Navegación con íconos pero muy oscura
- **Topbar**: Información de estado pero con estilo militar

### Problemas de Usabilidad
1. **Contraste excesivo**: Colores primarios muy saturados crean fatiga visual
2. **Tipografía poco legible**: Monoespaciada en todo, difícil de leer en cuerpo largo
3. **Falta de jerarquía visual**: Todo tiene el mismo peso visual
4. **Componentes poco profesionales**: Bordes dashed, notación militar no es SaaS
5. **Tablas confusas**: Sin badges claros, sin barras de progreso, información amontonada

## Visión del Rediseño

### Transformación a SaaS Profesional
- **Fondo**: Blanco y grises suaves (Linear, Vercel style)
- **Tipografía**: Inter 400/500, jerarquía clara
- **Colores**: Azul #378ADD como acento, grises neutros
- **Componentes**: Bordes 0.5px, cards minimalistas, badges de color
- **Sidebar**: Navegación limpia con íconos SVG simples
- **Topbar**: Logo + badge de estado + avatar, muy limpio

### Cambios Específicos
1. ✅ Reemplazar fondo negro por blanco/gris claro
2. ✅ Sidebar con íconos SVG simples
3. ✅ Topbar limpia: logo + badge + avatar
4. ✅ Cards de métricas: fondo blanco, borde 0.5px, acento 3px lateral
5. ✅ Tablas: badges de colores, barras de progreso, sin MAYÚSCULAS
6. ✅ Tipografía: Inter 400/500, 2 pesos
7. ✅ Paleta: blanco, grises suaves, azul #378ADD
8. ✅ Eliminar MAYÚSCULAS y notación militar

## Componentes Principales a Rediseñar
- Dashboard layout (sidebar + topbar + main)
- Metric cards (GTM Score, Strategic Move, Inferred Value)
- Leads table con badges y barras de progreso
- Geo map (mantener funcionalidad)
- Pipeline visualization
- Analytics section
