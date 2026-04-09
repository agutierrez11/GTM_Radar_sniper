# Dockerfile para NERV Frontend (Next.js)
FROM node:20-slim

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias
COPY apps/frontend/package.json ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código del frontend
COPY apps/frontend/ .

# Build de Next.js (Inyectamos variables con formato válido para que no falle el compilador)
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy
ENV SUPABASE_SERVICE_ROLE_KEY=dummy
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Puerto de Next.js
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"]
