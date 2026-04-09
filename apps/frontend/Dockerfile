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

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
RUN pnpm build

# Puerto de Next.js
EXPOSE 3000

# Comando para iniciar
CMD ["pnpm", "start"]
