# Merchant of Record (MoR) — Oportunidad LATAM 2026
> Tendencia transversal: iGaming, SaaS, eCommerce, Retail, Gaming, Streaming

## ¿Qué es un Merchant of Record?

Entidad legal que asume **toda la responsabilidad financiera y legal** de una transacción:
- Procesamiento de pagos (autorización → liquidación)
- Gestión fiscal global (IVA, GST, Sales Tax por jurisdicción)
- Compliance regulatorio (PCI-DSS, AML, KYC)
- Gestión de fraudes, chargebacks y reembolsos
- Soporte al cliente en pagos y facturación

## Mercado Global MoR

| Métrica | Dato |
|---------|------|
| Mercado global 2025 | **$6.46B USD** |
| Mercado global 2026 | **$7.38B USD** |
| Mercado global 2032 | **$17.03B USD** |
| CAGR | **14.83% anual** |
| Drivers principales | SaaS, eCommerce, suscripciones, productos digitales |

LATAM y Southeast Asia = mercados de **mayor crecimiento** en adopción de MoR.

## Comparativa de Modelos

| Modelo | Responsabilidad Legal | Gestión de Impuestos | Control Checkout |
|--------|----------------------|---------------------|-----------------|
| **MoR** | La asume el proveedor | Completa (global) | Menor (estandarizado) |
| PSP | La mantiene el negocio | El negocio es responsable | Mayor (personalizado) |
| SoR | La mantiene el negocio | El negocio es responsable | Control total |

## Por Qué LATAM es el Mercado MoR Más Urgente en 2026

### Brasil — El Más Complejo del Mundo
- Empresas gastan **+1,500 horas/año** en administración fiscal
- **Reforma fiscal 2026**: SaaS y digitales deben registrarse para IVA sin importar si tienen entidad local
- +100 millones de jugadores activos en iGaming
- Sin MoR → exposición fiscal directa desde primer peso cobrado

### México
- SPEI + OXXO como rails dominantes — no compatibles con checkout internacional estándar
- Sin adquirente local, decline rates del 30-60%
- dLocal, EBANX y Nuvei ya ofrecen MoR en México con peso mexicano nativo

### Colombia
- Coljuegos exige adquirente local para operadores iGaming
- Bre-B (equivalente a PIX) en adopción acelerada
- Sin MoR → riesgo regulatorio directo para operadores sin entidad local

## Verticales que Necesitan MoR en LATAM

| Vertical | Dolor | Urgencia |
|----------|-------|----------|
| **iGaming / Sports Betting** | Compliance fiscal + acquiring local + KYC | 🔴 Mundial 2026 |
| **SaaS Global** | IVA Brasil desde 2026, tax reform | 🔴 Alta |
| **eCommerce Cross-border** | Cuotas, métodos locales, moneda local | 🔴 Alta |
| **Gaming / App Stores** | In-app purchases, suscripciones regionales | 🟡 Media |
| **Streaming / Digital Content** | Suscripciones recurrentes en moneda local | 🟡 Media |
| **Marketplaces** | Split payments, compliance multi-vendedor | 🟡 Media |
| **EdTech** | Pagos recurrentes, compliance fiscal educativo | 🟡 Media |

## Proveedores — Ecosistema Completo

### Globales (No-LATAM Native)
| Proveedor | Foco | LATAM |
|-----------|------|-------|
| Paddle | SaaS / Digital | Limitado |
| Lemon Squeezy | SaaS / Indie | No |
| FastSpring | Software | Limitado |
| Cleverbridge | Enterprise SaaS | Limitado |
| Global-E | eCommerce físico | Parcial |
| Fungies | SaaS + Games | ✅ EU + LATAM |
| Dodo Payments | Micro-SaaS emergentes | ✅ LATAM |

### LATAM Native (Los más relevantes para NERV)
| Proveedor | Foco | Mercados |
|-----------|------|---------|
| **dLocal** | Emerging markets MoR | BR, MX, CO, AR, PE, CL |
| **EBANX** | Cross-border LATAM | BR, MX, CO, PE, AR, CL |
| **Nuvei** | iGaming + enterprise | BR, MX + expansión |
| **Coda** | Gaming / iGaming | BR, MX, CO |

## Señales de Momento para NERV (Growth Signals)

Una empresa necesita MoR cuando muestra estas señales:
- Job listing: "Tax Compliance Manager LATAM"
- Job listing: "Latin America Entity Setup / Expansion"
- Anuncio: "Expanding to Brazil/Mexico/Colombia"
- Press release: nueva licencia en país LATAM
- Funding round con mención de expansión LATAM
- Tech stack detectado: Paddle/Stripe sin integración local

Cualquiera de estas = `signal_type: EXPANSION` con `score_momento: 8+`

## Killer Arguments por Vertical

### Para iGaming
> "Stake tiene licencia en Brasil pero procesa en Curaçao. Cada transacción BRL tiene exposición fiscal no gestionada. Con la reforma fiscal 2026 ya activa, están en zona de riesgo regulatorio durante el Mundial — el mayor evento de apuestas de LATAM."

### Para SaaS Global
> "Desde 2026 Brasil exige registro fiscal para cualquier empresa digital que venda en el país, con o sin entidad local. Sin un MoR que gestione ese IVA, cada suscripción cobrada es una infracción fiscal acumulándose silenciosamente."

### Para eCommerce Cross-border
> "El 50% de consumidores brasileños decide el método de pago antes que el producto. Si tu checkout no ofrece PIX nativo, ya perdiste la mitad del mercado antes de que vean tu producto."

### Para Gaming / Apps
> "In-app purchases en Brasil sin Boleto/PIX como opción tienen tasas de conversión un 40% menores que con métodos locales. Cada actualización de tu juego que no incluye PIX es revenue que se queda en la mesa."

## El Oportunidad para NERV

### Nuevos Targets a Agregar
Empresas que necesitan MoR en LATAM:
- SaaS B2B y B2C con clientes en Brasil y México
- Apps móviles con +10k usuarios LATAM
- eCommerce que vende desde USA/Europa a LATAM
- iGaming operators con licencias pero sin estructura fiscal local
- Marketplaces con vendedores en múltiples países

### Vendor Map para NERV
```
NERV detecta → empresa con señal de expansión LATAM
NERV matchea → con el MoR correcto según vertical y mercado:
  iGaming → Nuvei, EBANX, Coda
  SaaS → dLocal, Paddle, Fungies
  eCommerce → dLocal, EBANX, Global-E
  Gaming → Coda, Fungies, EBANX
```

### Calendario de Urgencia 2026
| Fecha | Evento | Vertical Afectado |
|-------|--------|------------------|
| **Ahora** | Brasil reforma fiscal activa | SaaS + todos |
| **Junio 2026** | Mundial 2026 | iGaming |
| **Mayo 2026** | Hot Sale México | eCommerce |
| **Nov 2026** | Buen Fin + Black Friday | eCommerce + Retail |
| **Continuo** | Regulación iGaming por país | iGaming |

## Fuentes
- 360iResearch — MoR Software Market Size 2026-2032
- Coda Blog — MoR Gaming in LATAM
- GetSphere — Brazil Tax Reform SaaS impact
- dLocal — MoR Mexico modelo
- EBANX — Managed Payments product
- Cleverbridge — Top MoR Providers 2026
- Zintego — EBANX vs dLocal LATAM
- iGaming Business — Nuvei Pay2All Brazil acquisition
