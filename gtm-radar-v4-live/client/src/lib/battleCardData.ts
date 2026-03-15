// GTM Radar - Battle Cards Data
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD
// Propósito: Preparar al vendedor antes de una llamada

export interface BattleCard {
  id: string;
  type: 'company' | 'decision-makers' | 'pain' | 'value-prop' | 'competition' | 'objections' | 'script' | 'next-steps';
  title: string;
  icon: string;
  accentColor: string;
  content: string[];        // Lista de puntos clave
  aiGenerated?: boolean;
  tip?: string;             // Consejo rápido para el vendedor
}

export interface LeadBattleCards {
  leadId: string;
  company: string;
  contact: string;
  role: string;
  cards: BattleCard[];
}

const ACCENT = {
  blue:   '#378ADD',
  green:  '#22c55e',
  amber:  '#f59e0b',
  red:    '#ef4444',
  purple: '#a855f7',
  gray:   '#6b7280',
  teal:   '#14b8a6',
  rose:   '#f43f5e',
};

export const LEAD_BATTLE_CARDS: Record<string, LeadBattleCards> = {

  // ─── Lead 1: TechCorp Latam ───────────────────────────────────────────────
  'lead-001': {
    leadId: 'lead-001',
    company: 'TechCorp Latam',
    contact: 'Carlos Mendoza',
    role: 'CTO',
    cards: [
      {
        id: 'company',
        type: 'company',
        title: 'La Empresa',
        icon: '🏢',
        accentColor: ACCENT.blue,
        content: [
          'Empresa B2B de tecnología, 200+ empleados, presencia en 5 países LATAM',
          'Fundada en 2015, facturación $8M USD/año, crecimiento 25% YoY',
          'Sector fintech: soluciones de pagos y crédito para pymes',
          'Equipo de ventas: 8 personas, sin herramientas de inteligencia',
          'Stack actual: HubSpot básico, Excel para seguimiento',
        ],
        tip: 'Menciona su expansión regional como señal de que necesitan escalar sus procesos.',
      },
      {
        id: 'decision-makers',
        type: 'decision-makers',
        title: 'Decisores Clave',
        icon: '👥',
        accentColor: ACCENT.purple,
        content: [
          'Carlos Mendoza (CTO) — Contacto principal, decide herramientas tech',
          'Ana Ríos (VP Sales) — Usuaria final, siente el dolor del día a día',
          'Marco Díaz (CFO) — Aprueba presupuesto, enfocado en ROI',
          'Proceso de aprobación: CTO propone → CFO aprueba → CEO firma',
          'Tiempo de decisión estimado: 3-4 semanas',
        ],
        tip: 'Habla con Carlos sobre tecnología, pero prepara un caso de ROI para Marco.',
      },
      {
        id: 'pain',
        type: 'pain',
        title: 'Dolores Identificados',
        icon: '⚡',
        accentColor: ACCENT.amber,
        content: [
          'CRM desactualizado: datos inconsistentes, seguimiento manual',
          'Sin visibilidad de pipeline: el equipo no sabe en qué etapa está cada lead',
          'Tiempo perdido: cada vendedor gasta 2h/día buscando información de leads',
          'Expansión sin datos: están entrando a 3 países nuevos sin inteligencia de mercado',
          'Pérdida de oportunidades: leads calientes sin seguimiento oportuno',
        ],
        tip: 'Pregunta: "¿Cuánto tiempo pierde tu equipo buscando información antes de una llamada?"',
      },
      {
        id: 'value-prop',
        type: 'value-prop',
        title: 'Propuesta de Valor',
        icon: '🎯',
        accentColor: ACCENT.green,
        content: [
          'GTM Radar reduce el tiempo de investigación de 2h a 5 minutos por lead',
          'Inteligencia automática: señales de mercado, gaps y oportunidades en tiempo real',
          'Expansión LATAM: datos de mercado para los 3 países nuevos que planean entrar',
          'ROI estimado: 10x más leads analizados con el mismo equipo',
          'Integración con HubSpot en 1 día, sin cambiar su stack actual',
        ],
        tip: 'Enfócate en el ROI de tiempo: "8 vendedores × 2h/día = $X perdido por mes".',
      },
      {
        id: 'competition',
        type: 'competition',
        title: 'Competencia en la Mesa',
        icon: '⚔️',
        accentColor: ACCENT.rose,
        content: [
          'Salesforce Sales Cloud — Más caro, complejo de implementar, 6 meses de onboarding',
          'HubSpot Pro — Ya lo tienen pero no lo usan bien, sin inteligencia de mercado',
          'Apollo.io — Solo base de datos, sin análisis ni estrategia GTM',
          'Ventaja GTM Radar: inteligencia + estrategia + LATAM-first',
          'Diferenciador clave: análisis automático con IA, no solo datos crudos',
        ],
        tip: 'Si mencionan Salesforce: "Salesforce es un CRM, GTM Radar es inteligencia de mercado. Son complementarios."',
      },
      {
        id: 'objections',
        type: 'objections',
        title: 'Objeciones Comunes',
        icon: '🛡️',
        accentColor: ACCENT.red,
        content: [
          '"Ya tenemos HubSpot" → GTM Radar se integra con HubSpot, lo potencia, no lo reemplaza',
          '"Es caro" → ROI: 1 deal cerrado más por mes cubre el costo anual',
          '"No tenemos tiempo de implementar" → Onboarding en 1 día, no 6 meses',
          '"Necesito consultarlo con el equipo" → Ofrece demo para el equipo completo esta semana',
          '"No es prioridad ahora" → Su expansión a 3 países empieza en Q2, es urgente',
        ],
        tip: 'La objeción más común es el tiempo. Muestra el onboarding en vivo durante la demo.',
      },
      {
        id: 'script',
        type: 'script',
        title: 'Script de Llamada',
        icon: '📞',
        accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Carlos, vi que TechCorp está expandiendo a Colombia y Perú en Q2. ¿Cómo está preparando el equipo de ventas para esos mercados?"',
          'DOLOR: "¿Cuánto tiempo le toma a tu equipo prepararse para una llamada con un lead nuevo?"',
          'PROPUESTA: "GTM Radar hace eso en 5 minutos automáticamente. ¿Te muestro cómo?"',
          'DEMO: Mostrar análisis de un lead real de su industria en tiempo real',
          'CIERRE: "¿Qué tendría que ver en la demo para que esto tenga sentido para TechCorp?"',
        ],
        tip: 'Empieza con la pregunta de expansión. Les toca un punto de dolor inmediato.',
      },
      {
        id: 'next-steps',
        type: 'next-steps',
        title: 'Próximos Pasos',
        icon: '🚀',
        accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Demo técnica con Carlos (30 min)',
          '📋 Semana 2: Propuesta económica personalizada para CFO',
          '🧪 Mes 1: Piloto 30 días con 3 vendedores',
          '📈 Mes 2: Revisión de resultados + escalamiento a equipo completo',
          '📝 Mes 3: Contrato anual firmado',
        ],
        tip: 'Agenda la demo antes de terminar la llamada. No dejes sin fecha.',
      },
    ],
  },

  // ─── Lead 2: Retail Plus MX ───────────────────────────────────────────────
  'lead-002': {
    leadId: 'lead-002',
    company: 'Retail Plus MX',
    contact: 'Sofia Vargas',
    role: 'Directora Comercial',
    cards: [
      {
        id: 'company', type: 'company', title: 'La Empresa', icon: '🏢', accentColor: ACCENT.blue,
        content: [
          'Cadena de retail con 45 tiendas en México, facturación $12M USD/año',
          'En proceso de transformación digital desde 2023',
          'Equipo de ventas B2B: 15 personas, seguimiento en Excel',
          'Presión de e-commerce: Amazon y Mercado Libre creciendo en su segmento',
          'Presupuesto tech aprobado para digitalización: $15K/año máximo',
        ],
        tip: 'Retail en transformación = urgencia real. Aprovecha el momentum de cambio.',
      },
      {
        id: 'decision-makers', type: 'decision-makers', title: 'Decisores Clave', icon: '👥', accentColor: ACCENT.purple,
        content: [
          'Sofia Vargas (Directora Comercial) — Contacto principal, lidera digitalización',
          'Luis Torres (CEO) — Aprobación final, enfocado en competir con e-commerce',
          'Sofia tiene presupuesto de $15K/año para herramientas de ventas',
          'Proceso: Sofia recomienda → Luis aprueba en reunión semanal',
          'Tiempo de decisión: 2-3 semanas si hay ROI claro',
        ],
        tip: 'Sofia quiere quedar bien con Luis. Dale argumentos que ella pueda presentar al CEO.',
      },
      {
        id: 'pain', type: 'pain', title: 'Dolores Identificados', icon: '⚡', accentColor: ACCENT.amber,
        content: [
          'Seguimiento en Excel: sin visibilidad de pipeline, datos desactualizados',
          'Sin métricas: no saben cuántos leads se pierden por falta de seguimiento',
          'Resistencia al cambio: equipo de ventas acostumbrado a procesos manuales',
          'Presión competitiva: Amazon B2B creciendo en su segmento',
          'Sin datos de mercado: no saben qué empresas son sus mejores prospectos',
        ],
        tip: 'Pregunta: "¿Cuántos leads pierde tu equipo por no dar seguimiento a tiempo?"',
      },
      {
        id: 'value-prop', type: 'value-prop', title: 'Propuesta de Valor', icon: '🎯', accentColor: ACCENT.green,
        content: [
          'Digitaliza el proceso de ventas B2B sin cambiar cómo trabaja el equipo',
          'Reduce tiempo de seguimiento 60%, más tiempo para cerrar deals',
          'Visibilidad total del pipeline: Sofia ve el estado de cada lead en tiempo real',
          'Identificación automática de los mejores prospectos en su segmento',
          'ROI: 1 deal B2B adicional por mes cubre el costo anual ($15K)',
        ],
        tip: 'Enfócate en "sin cambiar cómo trabaja el equipo". Reduce la resistencia al cambio.',
      },
      {
        id: 'objections', type: 'objections', title: 'Objeciones Comunes', icon: '🛡️', accentColor: ACCENT.red,
        content: [
          '"Mi equipo no va a adoptar otra herramienta" → Onboarding de 1 día, interfaz simple',
          '"$15K es mucho" → 1 deal B2B adicional por mes lo paga. ¿Cuánto vale un deal?',
          '"Necesito aprobación del CEO" → Prepara el caso de ROI para Luis juntos',
          '"Estamos muy ocupados" → El piloto de 5 personas no interrumpe al equipo completo',
          '"No es el momento" → ¿Cuándo sería el momento? Amazon no espera.',
        ],
        tip: 'La objeción de adopción es la más real. Muestra lo simple que es en la demo.',
      },
      {
        id: 'script', type: 'script', title: 'Script de Llamada', icon: '📞', accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Sofia, vi que Retail Plus está digitalizando su operación. ¿Cómo va el proceso con el equipo de ventas B2B?"',
          'DOLOR: "¿Cuántos leads B2B pierde el equipo por falta de seguimiento oportuno?"',
          'PROPUESTA: "GTM Radar automatiza el seguimiento y da inteligencia de mercado. ¿Te muestro?"',
          'DEMO: Mostrar pipeline visual y análisis de lead en tiempo real',
          'CIERRE: "¿Qué necesitaría ver para recomendárselo a Luis esta semana?"',
        ],
        tip: 'Pregunta por Luis desde el inicio. Muestra que entiendes la dinámica de aprobación.',
      },
      {
        id: 'next-steps', type: 'next-steps', title: 'Próximos Pasos', icon: '🚀', accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Workshop con equipo de ventas (45 min)',
          '📋 Semana 2: Demo con Sofia + Luis (30 min)',
          '💰 Semana 3: Propuesta ajustada al presupuesto de $15K',
          '🧪 Mes 1: Piloto con 5 vendedores top',
          '📈 Mes 2: Escalamiento a equipo completo si resultados positivos',
        ],
        tip: 'El workshop con el equipo antes de la demo con el CEO es clave para reducir resistencia.',
      },
    ],
  },

  // ─── Lead 3: Logística Express ────────────────────────────────────────────
  'lead-003': {
    leadId: 'lead-003',
    company: 'Logística Express',
    contact: 'Roberto Kim',
    role: 'COO',
    cards: [
      {
        id: 'company', type: 'company', title: 'La Empresa', icon: '🏢', accentColor: ACCENT.blue,
        content: [
          'Logística last-mile en 8 ciudades, 500+ empleados, crecimiento 40% YoY',
          'Clientes: e-commerce, retail, farmacéutica. Ticket promedio B2B: $50K/año',
          'Equipo de ventas: 20 personas, Salesforce como CRM',
          'Presupuesto tech Q1 aprobado para herramientas de ventas',
          'Expansión a 3 ciudades nuevas en Q2 2025',
        ],
        tip: 'Empresa en hipercrecimiento. El dolor es escalar sin perder calidad de ventas.',
      },
      {
        id: 'decision-makers', type: 'decision-makers', title: 'Decisores Clave', icon: '👥', accentColor: ACCENT.purple,
        content: [
          'Roberto Kim (COO) — Contacto principal, presupuesto aprobado Q1',
          'Patricia Leal (VP Comercial) — Usuaria final, lidera el equipo de 20 vendedores',
          'Equipo IT: revisión de seguridad obligatoria antes de cualquier integración',
          'Proceso: Roberto + Patricia evalúan → IT aprueba → Roberto firma',
          'Tiempo de decisión: 4-6 semanas (por proceso IT)',
        ],
        tip: 'Involucra a IT desde el inicio. Un problema de seguridad puede matar el deal.',
      },
      {
        id: 'pain', type: 'pain', title: 'Dolores Identificados', icon: '⚡', accentColor: ACCENT.amber,
        content: [
          'Sin inteligencia de mercado: 20 vendedores sin datos de prospectos',
          'Pérdida de oportunidades: leads calientes sin seguimiento por volumen',
          'Expansión sin datos: 3 ciudades nuevas sin información de mercado local',
          'Salesforce subutilizado: tienen el CRM pero sin inteligencia encima',
          'Competencia de DHL y FedEx con más recursos y herramientas',
        ],
        tip: 'Pregunta: "¿Cuántas oportunidades pierde el equipo por no tener datos de prospectos a tiempo?"',
      },
      {
        id: 'value-prop', type: 'value-prop', title: 'Propuesta de Valor', icon: '🎯', accentColor: ACCENT.green,
        content: [
          'Inteligencia de mercado para 20 vendedores: datos de prospectos en 5 minutos',
          'Integración nativa con Salesforce: potencia su CRM sin reemplazarlo',
          'Expansión Q2: datos de mercado para las 3 ciudades nuevas desde día 1',
          'ROI: 1 deal enterprise adicional por mes ($50K) cubre 3 años de GTM Radar',
          'Ventaja competitiva vs. DHL/FedEx: inteligencia de mercado más rápida',
        ],
        tip: 'La integración con Salesforce es el diferenciador clave. Muéstrala en la demo.',
      },
      {
        id: 'objections', type: 'objections', title: 'Objeciones Comunes', icon: '🛡️', accentColor: ACCENT.red,
        content: [
          '"Ya tenemos Salesforce" → GTM Radar se integra con Salesforce, lo potencia',
          '"Proceso IT muy largo" → Tenemos documentación de seguridad lista para IT',
          '"HubSpot también está en evaluación" → GTM Radar es inteligencia, HubSpot es CRM',
          '"El equipo ya está saturado" → Piloto con 5 vendedores, no el equipo completo',
          '"Necesitamos ver ROI primero" → Piloto 30 días con métricas claras de éxito',
        ],
        tip: 'Prepara el paquete de seguridad para IT antes de la segunda reunión.',
      },
      {
        id: 'script', type: 'script', title: 'Script de Llamada', icon: '📞', accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Roberto, vi que Logística Express está expandiendo a 3 ciudades en Q2. ¿Cómo está preparando el equipo comercial para esos mercados?"',
          'DOLOR: "Con 20 vendedores, ¿cómo priorizan qué prospectos atacar primero en cada ciudad nueva?"',
          'PROPUESTA: "GTM Radar da inteligencia de mercado local en minutos y se integra con Salesforce. ¿Te muestro?"',
          'DEMO: Mostrar integración Salesforce + análisis de mercado logístico',
          'CIERRE: "¿Qué necesita ver el equipo de IT para avanzar? Les preparo el paquete de seguridad."',
        ],
        tip: 'Cierra siempre con el siguiente paso concreto. Con Roberto, es el paquete de IT.',
      },
      {
        id: 'next-steps', type: 'next-steps', title: 'Próximos Pasos', icon: '🚀', accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Demo técnica + integración Salesforce (45 min)',
          '🔒 Semana 2: Revisión de seguridad con equipo IT',
          '📋 Semana 3: Propuesta enterprise con SLA garantizado',
          '🧪 Mes 1: Piloto 30 días con 5 vendedores',
          '📝 Mes 2: Contrato enterprise 2 años ($36K/año)',
        ],
        tip: 'El paso de IT es el cuello de botella. Aceléralo enviando documentación antes de que la pidan.',
      },
    ],
  },

  // ─── Lead 4: Nubank ───────────────────────────────────────────────────────
  'lead-004': {
    leadId: 'lead-004',
    company: 'Nubank',
    contact: 'Ana Ríos',
    role: 'VP Growth LATAM',
    cards: [
      {
        id: 'company', type: 'company', title: 'La Empresa', icon: '🏢', accentColor: ACCENT.blue,
        content: [
          'Neobank líder en Brasil y LATAM, 80M+ clientes, valuación $30B+',
          'Expansión agresiva en México y Colombia con equipo B2B en crecimiento',
          'Stack tech: Segment, Amplitude, Salesforce. Muy data-driven',
          'Equipo de ventas B2B: 30 personas en LATAM',
          'Proceso de aprobación corporativo: largo y burocrático (8-12 semanas)',
        ],
        tip: 'Empresa muy data-driven. Habla en métricas, no en características.',
      },
      {
        id: 'decision-makers', type: 'decision-makers', title: 'Decisores Clave', icon: '👥', accentColor: ACCENT.purple,
        content: [
          'Ana Ríos (VP Growth LATAM) — Contacto principal, maneja presupuesto de herramientas',
          'David Vélez (CEO) — Aprobación final para contratos >$20K/año',
          'Equipo de seguridad: revisión obligatoria, muy estricto',
          'Legal: revisión de contrato 4-6 semanas adicionales',
          'Proceso: Ana evalúa → Seguridad aprueba → Legal revisa → CEO firma',
        ],
        tip: 'El proceso es largo. Empieza el proceso de seguridad y legal desde la primera reunión.',
      },
      {
        id: 'pain', type: 'pain', title: 'Dolores Identificados', icon: '⚡', accentColor: ACCENT.amber,
        content: [
          'CAC elevado en segmento B2B vs. competidores como BBVA y Santander',
          'Onboarding lento para clientes empresariales: 3-4 semanas vs. 1 semana de competidores',
          'Sin inteligencia de mercado para equipo de ventas empresarial',
          'Expansión México-Colombia sin datos de prospectos locales',
          'Equipo de 30 vendedores B2B con herramientas insuficientes',
        ],
        tip: 'El CAC es el dolor más cuantificable. Calcula cuánto les costaría reducirlo 30%.',
      },
      {
        id: 'value-prop', type: 'value-prop', title: 'Propuesta de Valor', icon: '🎯', accentColor: ACCENT.green,
        content: [
          'Reducción de CAC B2B 30%: inteligencia de mercado para priorizar los mejores prospectos',
          'Integración con Segment y Amplitude: potencia su stack actual sin reemplazarlo',
          'Expansión México-Colombia: datos de mercado local desde día 1',
          'ROI: reducción de CAC 30% = $X millones ahorrados por año',
          'Ventaja vs. BBVA/Santander: velocidad de identificación de oportunidades',
        ],
        tip: 'Calcula el ROI en dólares antes de la reunión. Nubank toma decisiones con datos.',
      },
      {
        id: 'objections', type: 'objections', title: 'Objeciones Comunes', icon: '🛡️', accentColor: ACCENT.red,
        content: [
          '"Ya tenemos Salesforce y Segment" → GTM Radar se integra con ambos, agrega inteligencia',
          '"Proceso de seguridad muy largo" → Tenemos SOC2 Type II y documentación lista',
          '"Necesitamos ver datos primero" → Piloto 60 días con métricas de éxito acordadas',
          '"El contrato lo revisa Legal" → Tenemos template estándar que acelera el proceso',
          '"No es prioridad Q1" → Su expansión Colombia empieza Q2, necesitan datos ahora',
        ],
        tip: 'Ten listo el certificado SOC2 y el template de contrato antes de la segunda reunión.',
      },
      {
        id: 'script', type: 'script', title: 'Script de Llamada', icon: '📞', accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Ana, vi que Nubank está expandiendo el equipo B2B en México y Colombia. ¿Cómo están midiendo el CAC en esos mercados?"',
          'DOLOR: "¿Cuánto tiempo le toma al equipo identificar y calificar un prospecto B2B en un mercado nuevo?"',
          'PROPUESTA: "GTM Radar reduce ese tiempo 90% y se integra con Segment. ¿Te muestro el impacto en CAC?"',
          'DEMO: Mostrar integración Segment + análisis de CAC con datos del sector fintech',
          'CIERRE: "¿Qué métricas necesitas ver en un piloto de 60 días para justificar el contrato?"',
        ],
        tip: 'Habla de CAC desde el inicio. Es el KPI que Ana reporta a David Vélez.',
      },
      {
        id: 'next-steps', type: 'next-steps', title: 'Próximos Pasos', icon: '🚀', accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Reunión con Ana + equipo técnico (45 min)',
          '🔒 Semana 2: Análisis de integración con Segment + revisión seguridad',
          '📊 Semana 3: Propuesta ROI detallada para presentar a David',
          '🧪 Mes 1-2: Piloto 60 días con métricas de CAC acordadas',
          '📝 Mes 3: Contrato anual ($45K/año)',
        ],
        tip: 'Empieza el proceso de seguridad en paralelo con la evaluación técnica. Ahorra 4 semanas.',
      },
    ],
  },

  // ─── Lead 5: Mercado Libre ────────────────────────────────────────────────
  'lead-005': {
    leadId: 'lead-005',
    company: 'Mercado Libre',
    contact: 'Marco Díaz',
    role: 'VP Partnerships LATAM',
    cards: [
      {
        id: 'company', type: 'company', title: 'La Empresa', icon: '🏢', accentColor: ACCENT.blue,
        content: [
          'Plataforma e-commerce líder en LATAM, $10B+ GMV anual, 18 países',
          '100M+ usuarios activos, expansión agresiva en servicios financieros',
          'Equipo de partnerships: 50+ personas en LATAM',
          'Stack tech: propio + Salesforce + herramientas internas',
          'Proceso de aprobación: 6-12 meses para contratos enterprise',
        ],
        tip: 'Mercado Libre no es solo un cliente, es un potencial partner estratégico. Piensa en co-marketing.',
      },
      {
        id: 'decision-makers', type: 'decision-makers', title: 'Decisores Clave', icon: '👥', accentColor: ACCENT.purple,
        content: [
          'Marco Díaz (VP Partnerships LATAM) — Contacto principal, autoridad total en partnerships',
          'Marcos Galperin (CEO) — Aprobación final para contratos estratégicos',
          'Equipo legal: revisión muy estricta, 6-8 semanas adicionales',
          'Equipo de seguridad: SOC2 Type II mínimo requerido',
          'Proceso: Marco evalúa → Legal → Seguridad → CEO firma',
        ],
        tip: 'Marco tiene autoridad real. Si lo convences a él, el proceso avanza.',
      },
      {
        id: 'pain', type: 'pain', title: 'Dolores Identificados', icon: '⚡', accentColor: ACCENT.amber,
        content: [
          'Fricción en checkout para vendedores B2B: proceso de onboarding lento',
          'Sin inteligencia de mercado para equipo de partnerships en 18 países',
          'Expansión a 5 países nuevos en 2025 sin datos de GTM local',
          'Competencia de Amazon B2B creciendo en su segmento',
          'Equipo de 50+ personas de partnerships sin herramientas de inteligencia',
        ],
        tip: 'La expansión a 5 países es el dolor más urgente. Enfócate en ese caso de uso.',
      },
      {
        id: 'value-prop', type: 'value-prop', title: 'Propuesta de Valor', icon: '🎯', accentColor: ACCENT.green,
        content: [
          'GTM Intelligence para 50+ personas de partnerships en 18 países',
          'Expansión 5 países: datos de mercado local desde día 1 en cada nuevo mercado',
          'Integración nativa con su stack (Salesforce + APIs propias)',
          'Partnership estratégico: co-marketing, caso de éxito conjunto',
          'ROI: 1 partnership enterprise adicional por trimestre = $X millones',
        ],
        tip: 'Propón un partnership estratégico, no solo una venta. Cambia la conversación.',
      },
      {
        id: 'objections', type: 'objections', title: 'Objeciones Comunes', icon: '🛡️', accentColor: ACCENT.red,
        content: [
          '"Tenemos herramientas internas" → GTM Radar complementa, no reemplaza. API disponible',
          '"Proceso legal muy largo" → Tenemos template enterprise que acelera el proceso',
          '"Necesitamos SOC2" → Tenemos SOC2 Type II certificado',
          '"No es prioridad" → Su expansión a 5 países empieza Q1 2025, es urgente',
          '"Queremos un partnership, no una compra" → Abiertos a modelo de partnership con revenue share',
        ],
        tip: 'Si mencionan partnership, no lo rechaces. Puede ser un deal 10x más grande.',
      },
      {
        id: 'script', type: 'script', title: 'Script de Llamada', icon: '📞', accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Marco, vi que Mercado Libre está expandiendo a 5 países nuevos en 2025. ¿Cómo está preparando el equipo de partnerships para esos mercados?"',
          'DOLOR: "Con 50+ personas de partnerships en 18 países, ¿cómo priorizan qué oportunidades atacar primero en cada mercado nuevo?"',
          'PROPUESTA: "GTM Radar da inteligencia de mercado local para cada país. ¿Exploramos también un modelo de partnership?"',
          'DEMO: Mostrar análisis de mercado para uno de los 5 países nuevos',
          'CIERRE: "¿Qué tendría que ver para explorar un partnership estratégico con GTM Radar?"',
        ],
        tip: 'Abre la puerta al partnership desde la primera llamada. Cambia la dinámica de poder.',
      },
      {
        id: 'next-steps', type: 'next-steps', title: 'Próximos Pasos', icon: '🚀', accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Reunión ejecutiva con Marco (45 min)',
          '🤝 Semana 2: Demo enterprise + exploración de modelo partnership',
          '📋 Semana 3: Propuesta dual: contrato enterprise + partnership estratégico',
          '🔒 Mes 2-3: Revisión legal y seguridad en paralelo',
          '📝 Mes 4-6: Contrato enterprise 3 años o acuerdo de partnership',
        ],
        tip: 'Este deal puede tardar 6-12 meses. Mantén el momentum con updates mensuales.',
      },
    ],
  },

  // ─── Lead 6: Perplexity AI ────────────────────────────────────────────────
  'lead-006': {
    leadId: 'lead-006',
    company: 'Perplexity AI',
    contact: 'Luis Torres',
    role: 'Head of LATAM Expansion',
    cards: [
      {
        id: 'company', type: 'company', title: 'La Empresa', icon: '🏢', accentColor: ACCENT.blue,
        content: [
          'Motor de búsqueda con IA, $500M+ en valuación, 10M+ usuarios activos',
          'Expansión agresiva a LATAM en 2025, equipo de ventas B2B recién formado',
          'Equipo LATAM: 5 personas, sin herramientas de GTM locales',
          'Presupuesto de expansión LATAM: aprobado pero sin definir para herramientas',
          'Decisiones se toman en USA, proceso de aprobación lento',
        ],
        tip: 'Empresa joven en LATAM = oportunidad de ser su primer partner de GTM en la región.',
      },
      {
        id: 'decision-makers', type: 'decision-makers', title: 'Decisores Clave', icon: '👥', accentColor: ACCENT.purple,
        content: [
          'Luis Torres (Head of LATAM Expansion) — Contacto principal, lidera la expansión',
          'Aravind Srinivas (CEO) — Aprobación final desde USA para contratos >$10K',
          'Equipo de finanzas en USA: aprobación de presupuesto',
          'Proceso: Luis recomienda → Finanzas aprueba → CEO confirma',
          'Tiempo de decisión: 4-8 semanas (por burocracia interna en USA)',
        ],
        tip: 'Luis necesita resultados rápidos para justificar su rol. Ayúdalo a quedar bien.',
      },
      {
        id: 'pain', type: 'pain', title: 'Dolores Identificados', icon: '⚡', accentColor: ACCENT.amber,
        content: [
          'Sin estrategia GTM clara para LATAM: equipo de 5 personas sin datos de mercado',
          'Presión de resultados: Luis necesita mostrar tracción en LATAM en Q1',
          'Sin partnerships locales: no conocen el ecosistema de cada país',
          'Competencia de Google y OpenAI con más recursos y presencia local',
          'Sin datos de prospectos enterprise en 5 países objetivo',
        ],
        tip: 'Luis está bajo presión de mostrar resultados. GTM Radar puede ser su primer win.',
      },
      {
        id: 'value-prop', type: 'value-prop', title: 'Propuesta de Valor', icon: '🎯', accentColor: ACCENT.green,
        content: [
          'Estrategia GTM LATAM en 30 días: 100 leads enterprise identificados y analizados',
          'Datos de mercado para 5 países: México, Brasil, Colombia, Argentina, Chile',
          'Identificación de partners estratégicos en cada país',
          'ROI: Luis puede presentar a Aravind 100 oportunidades concretas en Q1',
          'Ventaja vs. Google/OpenAI: velocidad de entrada al mercado LATAM',
        ],
        tip: 'Vende el resultado concreto: "100 leads enterprise en 30 días". Luis puede presentarlo a su CEO.',
      },
      {
        id: 'objections', type: 'objections', title: 'Objeciones Comunes', icon: '🛡️', accentColor: ACCENT.red,
        content: [
          '"No tenemos presupuesto definido" → Piloto gratuito 2 semanas para demostrar valor',
          '"Las decisiones se toman en USA" → Prepara el caso de ROI para presentar a Aravind',
          '"Somos muy pequeños en LATAM" → Exacto, por eso necesitan inteligencia de mercado',
          '"No es prioridad ahora" → ¿Cuándo necesita Luis mostrar resultados a su CEO?',
          '"Ya tenemos datos de Google" → GTM Radar da inteligencia de ventas, no solo búsqueda',
        ],
        tip: 'Ofrece un piloto gratuito de 2 semanas. Bajo riesgo para Luis, alta probabilidad de cierre.',
      },
      {
        id: 'script', type: 'script', title: 'Script de Llamada', icon: '📞', accentColor: ACCENT.teal,
        content: [
          'APERTURA: "Luis, vi que Perplexity está expandiendo a LATAM en 2025. ¿Cuál es la mayor dificultad que estás encontrando en los primeros meses?"',
          'DOLOR: "¿Cómo estás identificando qué empresas son los mejores prospectos enterprise en cada país?"',
          'PROPUESTA: "GTM Radar puede darte 100 leads enterprise calificados en 30 días. ¿Te muestro cómo?"',
          'DEMO: Mostrar análisis de mercado para México o Brasil con leads enterprise reales',
          'CIERRE: "¿Qué necesitarías ver en 2 semanas de piloto para recomendárselo a Aravind?"',
        ],
        tip: 'Empieza con la pregunta de dificultad. Luis querrá desahogarse. Escucha antes de proponer.',
      },
      {
        id: 'next-steps', type: 'next-steps', title: 'Próximos Pasos', icon: '🚀', accentColor: ACCENT.gray,
        content: [
          '✅ Esta semana: Demo con Luis + equipo LATAM (30 min)',
          '🆓 Semana 2: Piloto gratuito 2 semanas: 100 leads enterprise',
          '📊 Semana 3: Revisión de resultados del piloto',
          '📋 Semana 4: Propuesta para presentar a Aravind en USA',
          '📝 Mes 2: Contrato anual ($30K/año)',
        ],
        tip: 'El piloto gratuito elimina la fricción del presupuesto. Es el camino más rápido al cierre.',
      },
    ],
  },
};
