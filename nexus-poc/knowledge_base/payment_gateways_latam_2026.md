# Pasarelas de Pago LATAM 2026 — Mapa por País
> Fuente: Investigación de mercado 2026 — Chile, Perú, Colombia, Argentina
> Relevancia NERV: targets directos para dLocal, EBANX, Nuvei + señales de fragmentación del mercado

---

## Resumen Regional

| País | Gateways activos | Regulador | Rail dominante | Señal clave 2026 |
|------|-----------------|-----------|---------------|-----------------|
| Colombia | **70+** | SFC | PSE + Nequi | Mayor ecosistema de la región |
| Chile | **55+** | CMF | WebPay (Transbank) | Consolidación en curso |
| Perú | **45+** | BCRP | PagoEfectivo | PSPs ahora regulados formalmente |
| Argentina | **20+** | BCRA | Mercado Pago | Control de cambios limita cross-border |

---

## 🇨🇴 Colombia — 70+ Pasarelas

### Contexto Regulatorio
- Regulador: **SFC** (Superintendencia Financiera de Colombia)
- 2024–2025: AvaTrade, Libertex, Plus500 obtuvieron licencias SFC → señal de entrada masiva de brokers
- PSE (Pagos Seguros en Línea) = rail dominante para B2C

### Métodos de Pago Principales
| Método | Tipo | Alcance |
|--------|------|---------|
| **PSE** | Transferencia bancaria online | Estándar nacional |
| **Nequi** | Wallet digital (Bancolombia) | 17M+ usuarios |
| **Daviplata** | Wallet digital (Davivienda) | 12M+ usuarios |
| **Efecty** | Pago en efectivo | Red nacional |
| **Baloto** | Pago en efectivo | Red nacional |
| **Tarjetas** | Visa/MC/Amex | Penetración media |
| **Addi** | BNPL | Creciente |

### Gateways Destacados
PayU Colombia, Wompi (Bancolombia), ePayco, Kushki CO, PayRetailers, dLocal CO, EBANX CO, Conekta CO, MercadoPago CO, Redeban, Credibanco

### Señal NERV
> Colombia tiene 70+ gateways pero PSE sigue siendo el cuello de botella: es el único método de transferencia bancaria en tiempo real. Cualquier operador internacional que entre post-licencia SFC necesita integración PSE desde día 1. Sin PSE = sin depósitos.

---

## 🇨🇱 Chile — 55+ Pasarelas

### Contexto Regulatorio
- Regulador: **CMF** (Comisión para el Mercado Financiero)
- Ley Fintech Chile (2023) aceleró entrada de nuevos actores
- Plus500 obtuvo licencia CMF en proceso (2025)

### Métodos de Pago Principales
| Método | Tipo | Alcance |
|--------|------|---------|
| **WebPay Plus (Transbank)** | Tarjeta online | Dominante histórico |
| **Khipu** | Transferencia bancaria | Creciente |
| **Mach** | Wallet digital (BCI) | Jóvenes |
| **FPAY** | Wallet Falabella | Retail integrado |
| **Redcompra** | Débito presencial | Estándar |
| **Multicaja** | Efectivo | Zonas rurales |
| **Tarjetas CMR** | Crédito Falabella | Retail |

### Gateways Destacados
Transbank, Khipu, Flow.cl, Kushki CL, PayRetailers CL, dLocal CL, MercadoPago CL, GetNet, Fintoc (Open Banking), Getnet (Santander)

### Señal NERV
> Chile está en transición: Transbank dominó por décadas pero la Ley Fintech abrió el mercado. Fintoc (Plaid para LATAM) crece como capa de open banking. Cualquier SaaS o eCommerce que entra a Chile hoy tiene que elegir entre el stack tradicional (Transbank) o apostar por la nueva infraestructura (Khipu + Fintoc). El que llega con la solución correcta gana el contrato de toda la región andina.

---

## 🇵🇪 Perú — 45+ Pasarelas

### Contexto Regulatorio — CRÍTICO 2026
- Regulador: **BCRP** (Banco Central de Reserva del Perú) + **SBS**
- **Aprobación**: Circular 0022-2025-BCRP — Nuevo Reglamento del Sistema Nacional de Pagos
- **Vigencia**: **1 de abril de 2026** — ya está en vigor
- PSPs reconocidos formalmente como actores regulados por primera vez en la historia del sistema
- Nuevos requisitos: capital mínimo, gestión de riesgos, consentimiento explícito del usuario
- Impacto: fintechs de wallets y pagos inmediatos ahora tienen obligaciones equivalentes a entidades financieras
- **Deadlines escalonados hasta fin de 2026** según volumen mensual de operaciones (los más grandes primero)
- **5 poderes formales del BCRP**: regulatorio/mandatorio, interpretativo, implementación/administración, supervisorio, sancionatorio
- El BCRP deja de ser árbitro técnico → pasa a ser orquestador de normas, supervisión, sanciones, interoperabilidad, tarifas y competencia
- **No se fijarán topes de comisiones** pero se exigirá transparencia y justificación de tarifas

### Métodos de Pago Principales
| Método | Tipo | Alcance |
|--------|------|---------|
| **PagoEfectivo** | Código de pago en efectivo | Estándar nacional |
| **Yape** (BCP) | Wallet digital | 14M+ usuarios — el más usado |
| **Plin** | Wallet interoperable | Scotiabank + BBVA + Interbank |
| **Izipay** | POS + gateway | SMBs |
| **Niubiz** (VisaNet Perú) | Adquirente | Dominante en tarjetas |
| **Safetypay** | Efectivo + transferencia | Cross-border |

### Gateways Destacados
PagoEfectivo, Culqi, Izipay, Niubiz, PayRetailers PE, dLocal PE, MercadoPago PE, Openpay PE, Kushki PE, Alignet

### Señal NERV
> Yape tiene 14M+ usuarios en un país de 33M habitantes. La nueva regulación BCRP (feb 2026) convierte a los PSPs en actores regulados — doble impacto: los que cumplen ganan legitimidad, los que no pueden operar. Para payment processors que entran a Perú, el timing es ahora: antes de que los incumbentes locales terminen de adaptarse a la regulación.

---

## 🇦🇷 Argentina — 20+ Pasarelas Activas

### Contexto Regulatorio — Complejidad Máxima
- Regulador: **BCRA** (Banco Central de la República Argentina)
- Registro de PSPs: bcra.gob.ar/registro-de-proveedores-de-servicios-de-pago
- **9 categorías oficiales de PSPs registrados en BCRA**:
  1. Proveedores de cuentas de pago
  2. Aceptadores
  3. Administradores de QR
  4. Iniciadores de pago
  5. Adquirentes
  6. Redes de cajeros automáticos (ATM)
  7. Agregadores
  8. Redes de transferencia electrónica de fondos
  9. Cobranzas extrabancarias
- BCRA exige a billeteras digitales (Mercado Pago, Ualá) mismos estándares de protección al cliente que bancos tradicionales
- Agenda 2026: crédito + open finance + salarios vía billeteras digitales — nueva etapa de madurez
- **Control de cambios**: limita severamente el cross-border en pesos
- Inflación + devaluación = stablecoins como alternativa creciente (USDT/USDC)
- Mercado Pago procesa ~60% del volumen digital

### Métodos de Pago Principales
| Método | Tipo | Alcance |
|--------|------|---------|
| **Mercado Pago** | Wallet + gateway | Dominante absoluto |
| **Modo** | Wallet bancaria interoperable | Bancos grandes |
| **DEBIN** | Débito inmediato bancario | B2B + grandes pagos |
| **Rapipago** | Efectivo | Red nacional |
| **Pago Fácil** | Efectivo | Red nacional |
| **Naranja X** | Wallet + crédito | Interior del país |
| **USDT/USDC** | Stablecoin | FX volatilidad |

### Gateways Destacados
Mercado Pago, Todo Pago, PayU AR, dLocal AR, Pomelo (BaaS), Bind (open banking), Boa Compra, Payoneer AR, Rebill (suscripciones)

### Señal NERV
> Argentina tiene el ecosistema más complejo de LATAM: control de cambios, inflación, stablecoins como alternativa de facto, y Mercado Pago con 60%+ del mercado. Cualquier empresa que entra necesita una estrategia de FX desde el día 1. El caso de uso de stablecoins (BVNK/Mastercard) es más urgente aquí que en cualquier otro país de la región.

---

## Mapa de Oportunidad para Payment Processors (NERV Targets)

### Por País — Señal de Urgencia

| País | Señal principal | Urgencia | PSP recomendado |
|------|----------------|----------|-----------------|
| Colombia | 70+ gateways + entrada masiva brokers post-SFC | 🔴 Alta | dLocal, EBANX |
| Perú | Nueva regulación BCRP feb 2026 | 🔴 Alta | dLocal, PagoEfectivo |
| Chile | Post-Ley Fintech, open banking naciente | 🟡 Media-Alta | Kushki, Fintoc, dLocal |
| Argentina | Control de cambios + stablecoins | 🟡 Media | dLocal (complejo), Pomelo |

### Señales de Compra para NERV

Un operador necesita PSP local cuando muestra:
- Nuevo mercado en su web (dropdown país)
- Job listing "Country Manager [País LATAM]"
- Licencia regulatoria nueva (SFC, CMF, BCRP)
- Spike de tráfico orgánico desde país sin checkout local
- Tech stack: solo Stripe/Braintree sin rails locales

---

## Fuentes
- Investigación de mercado pasarelas LATAM 2026
- BCRP — Registro de Proveedores de Servicios de Pago (feb 2026)
- SFC Colombia — Autorizaciones 2024–2025
- CMF Chile — Ley Fintech implementación
- iupana.com — PSP Perú nuevo actor regulado (feb 2026)
- AMVO — Métodos de pago México 2026
