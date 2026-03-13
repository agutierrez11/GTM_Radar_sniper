
# SOP: Control de Cerraduras (RLS) en Supabase 🔐

Este documento contiene las "llaves" de tu base de datos. Si alguna vez necesitas abrir las puertas para un cambio masivo, solo tienes que seguir estos pasos.

### 1. ¿Cómo aplicar las cerraduras ahora?
Copia el siguiente código SQL y pégalo en el **SQL Editor** de tu panel de Supabase y dale a **Run**.

```sql
-- 1. Habilitar RLS en las tablas principales
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fintech_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relaciones ENABLE ROW LEVEL SECURITY;

-- 2. Crear política de 'Solo Lectura' para todo el mundo (Dashboard)
-- Esto permite que el dashboard en Vercel vea los datos, pero nadie pueda borrarlos.
CREATE POLICY "Permitir lectura pública" 
ON public.empresas FOR SELECT 
USING (true);

CREATE POLICY "Permitir lectura pública leads" 
ON public.fintech_leads FOR SELECT 
USING (true);

-- 3. Asegurar que el Sniper (service_role) pueda hacer de todo
-- El Sniper usa una llave maestra que salta estas reglas, así que seguirá funcionando.
```

### 2. ¿Cómo "abrir" la cerradura después?
Si quieres volver al estado actual (puertas abiertas para edición manual total desde cualquier sitio sin políticas):

1. Ve a **Table Editor** en Supabase.
2. Haz clic en el escudo que dice **RLS** arriba a la derecha de la tabla.
3. Cámbialo a **Off**.

O corre este comando en el SQL Editor:
```sql
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
```

---
**Nota de Antigravity:** He dejado este archivo en tu carpeta raíz para que siempre tengas el control. No tardas más de 30 segundos en aplicarlo.
