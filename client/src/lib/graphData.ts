// GTM Radar - Graph View Data Types & Mock Data
// Design: SaaS Professional (Linear/Vercel/Stripe inspired)
// Paleta: Blanco, grises suaves, azul #378ADD
// Todos los leads tienen su propio mapa conceptual

export interface LeadNode {
  id: string;
  type: 'main' | 'concept' | 'detail';
  label: string;
  content: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  icon?: string;
}

export interface LeadEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface LeadGraph {
  leadId: string;
  leadName: string;
  company: string;
  score: number;
  status: string;
  aiAnalyzed?: boolean;   // true = analizado por CrewAI
  aiAnalyzing?: boolean;  // true = en proceso de análisis
  nodes: LeadNode[];
  edges: LeadEdge[];
}

export const NODE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', badge: '#3b82f6' },
  green:  { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', badge: '#22c55e' },
  amber:  { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#f59e0b' },
  red:    { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#ef4444' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8', badge: '#a855f7' },
  gray:   { bg: '#f9fafb', border: '#e5e7eb', text: '#374151', badge: '#6b7280' },
};

// Edges estándar para todos los leads
export const STANDARD_EDGES: LeadEdge[] = [
  { id: 'e1', source: 'main', target: 'who',           label: 'Contactos' },
  { id: 'e2', source: 'main', target: 'market',        label: 'Opera en' },
  { id: 'e3', source: 'market', target: 'gaps',        label: 'Genera' },
  { id: 'e4', source: 'gaps', target: 'opportunities', label: 'Abre' },
  { id: 'e5', source: 'opportunities', target: 'strategy', label: 'Define' },
  { id: 'e6', source: 'strategy', target: 'risks',     label: 'Considera' },
  { id: 'e7', source: 'strategy', target: 'next',      label: 'Ejecutar' },
];

// 6 leads con mapas conceptuales completos
export const LEAD_GRAPHS: Record<string, LeadGraph> = {

  // ─── Lead 1: TechCorp Latam ───────────────────────────────────────────────
  'lead-001': {
    leadId: 'lead-001',
    leadName: 'Carlos Mendoza',
    company: 'TechCorp Latam',
    score: 87,
    status: 'gold',
    aiAnalyzed: true,
    nodes: [
      { id: 'main', type: 'main', label: 'TechCorp Latam', color: 'blue',
        content: 'Empresa de tecnología B2B con presencia en 5 países de LATAM. Fundada en 2015, 200+ empleados. Facturación $8M USD/año.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Carlos Mendoza (CTO), Ana Ríos (VP Sales), Marco Díaz (CFO). Carlos es el contacto principal con poder de decisión en tecnología.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'Sector fintech B2B en expansión. Mercado objetivo: pymes de 50-500 empleados. Competidores: Konfío, Clip, Conekta.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'CRM desactualizado. Sin automatización de seguimiento. Equipo de 8 vendedores sin herramientas de inteligencia de mercado.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'GTM Radar para equipo de ventas. Potencial $24,000/año. Expansión a 3 países en Q2 2025. Caso de éxito replicable.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Demo personalizada con caso de uso fintech. Piloto 30 días para 3 vendedores. Escalamiento a equipo completo en mes 2.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Presupuesto Q4 ya comprometido. Proceso de aprobación largo (3-4 semanas). Salesforce también en conversación.' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Demo técnica con Carlos (esta semana)\n2. Propuesta económica (semana 2)\n3. Piloto 30 días (mes 1)\n4. Contrato anual (mes 2)' },
    ],
    edges: STANDARD_EDGES,
  },

  // ─── Lead 2: Retail Plus MX ───────────────────────────────────────────────
  'lead-002': {
    leadId: 'lead-002',
    leadName: 'Sofia Vargas',
    company: 'Retail Plus MX',
    score: 72,
    status: 'silver',
    aiAnalyzed: true,
    nodes: [
      { id: 'main', type: 'main', label: 'Retail Plus MX', color: 'blue',
        content: 'Cadena de retail con 45 tiendas en México. Facturación anual $12M USD. En proceso de transformación digital desde 2023.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Sofia Vargas (Directora Comercial), Luis Torres (CEO). Sofia lidera la iniciativa de digitalización del equipo de ventas B2B.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'Retail tradicional en transición digital. Presión de e-commerce (Mercado Libre, Amazon). Necesidad urgente de modernización.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'Equipo de ventas B2B sin herramientas digitales. Seguimiento de clientes en Excel. Sin visibilidad de pipeline ni métricas.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'Digitalizar equipo de 15 vendedores B2B. Potencial $18,000/año. Caso de éxito replicable en otras cadenas retail de México.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Enfoque en ROI medible: reducción de tiempo de seguimiento 60%. Piloto con 5 vendedores top. Presentación a CEO en semana 3.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Resistencia al cambio del equipo de ventas. Presupuesto limitado ($15K/año máximo). Decisión dependiente del CEO.' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Workshop con equipo de ventas (esta semana)\n2. Demo con Sofia + Luis (semana 2)\n3. Propuesta ajustada a presupuesto\n4. Piloto 5 vendedores' },
    ],
    edges: STANDARD_EDGES,
  },

  // ─── Lead 3: Logística Express ────────────────────────────────────────────
  'lead-003': {
    leadId: 'lead-003',
    leadName: 'Roberto Kim',
    company: 'Logística Express',
    score: 91,
    status: 'gold',
    aiAnalyzed: true,
    nodes: [
      { id: 'main', type: 'main', label: 'Logística Express', color: 'blue',
        content: 'Empresa de logística last-mile con operaciones en 8 ciudades. 500+ empleados. Crecimiento 40% YoY. Presupuesto tech aprobado Q1.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Roberto Kim (COO), Patricia Leal (VP Comercial). Roberto tiene presupuesto aprobado para herramientas de ventas Q1 2025.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'Logística B2B en boom post-pandemia. Clientes: e-commerce, retail, farmacéutica. Competidores: DHL, FedEx, Estafeta.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'Equipo de 20 vendedores sin inteligencia de mercado. Pérdida de oportunidades por falta de seguimiento. Sin análisis de competencia.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'GTM Radar para equipo completo de 20 vendedores. Potencial $36,000/año. Expansión a 3 ciudades nuevas en Q2 2025.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Propuesta enterprise con SLA garantizado. Integración con Salesforce. Onboarding completo del equipo. Contrato 2 años.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Integración técnica compleja con Salesforce. Proceso de seguridad IT largo. HubSpot también en evaluación.' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Demo técnica + integración Salesforce (esta semana)\n2. Revisión seguridad IT (semana 2)\n3. Propuesta enterprise (semana 3)\n4. Firma contrato 2 años' },
    ],
    edges: STANDARD_EDGES,
  },

  // ─── Lead 4: Nubank ───────────────────────────────────────────────────────
  'lead-004': {
    leadId: 'lead-004',
    leadName: 'Ana Ríos',
    company: 'Nubank',
    score: 65,
    status: 'gold',
    aiAnalyzed: false,
    nodes: [
      { id: 'main', type: 'main', label: 'Nubank', color: 'blue',
        content: 'Neobank líder en Brasil y LATAM. 80M+ clientes. Expansión agresiva en México y Colombia. Equipo de ventas B2B en crecimiento.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Ana Ríos (VP Growth LATAM), David Vélez (CEO). Ana maneja el presupuesto de herramientas de crecimiento y ventas B2B.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'Fintech de consumo con expansión B2B. Segmento: empresas 10-500 empleados. Competidores: BBVA, Santander, Mercado Pago.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'Onboarding lento para clientes B2B. CAC elevado vs. competidores. Sin herramientas de inteligencia para equipo de ventas empresarial.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'GTM Intelligence para equipo B2B de 30 vendedores. Potencial $45,000/año. Reducción de CAC 30%. Expansión México-Colombia.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Caso de estudio con ROI claro. Integración con stack actual (Segment, Amplitude). Piloto 60 días con equipo México.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Proceso de aprobación corporativo muy largo. Equipo de seguridad estricto. Competidor Salesforce ya instalado en la empresa.' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Reunión con Ana + equipo técnico (esta semana)\n2. Análisis de integración con Segment (semana 2)\n3. Propuesta ROI detallada\n4. Piloto México 60 días' },
    ],
    edges: STANDARD_EDGES,
  },

  // ─── Lead 5: Mercado Libre ────────────────────────────────────────────────
  'lead-005': {
    leadId: 'lead-005',
    leadName: 'Marco Díaz',
    company: 'Mercado Libre',
    score: 94,
    status: 'diamond',
    aiAnalyzed: false,
    nodes: [
      { id: 'main', type: 'main', label: 'Mercado Libre', color: 'blue',
        content: 'Plataforma de e-commerce líder en LATAM. $10B+ en GMV anual. Operaciones en 18 países. Expansión agresiva de servicios financieros.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Marco Díaz (VP Partnerships LATAM), Marcos Galperin (CEO). Marco tiene autoridad total sobre partnerships estratégicos y herramientas B2B.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'E-commerce + Fintech en LATAM. 100M+ usuarios activos. Expansión en pagos cross-border. Competidores: Amazon, Shopify, Rappi.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'Fricción en checkout para vendedores B2B. Sin inteligencia de mercado para equipo de partnerships. Expansión regional sin datos de GTM.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'GTM Radar enterprise para 50+ vendedores y partnerships. Potencial $120,000/año. Caso de uso: expansión a 5 nuevos países en 2025.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Partnership estratégico (no solo cliente). Co-marketing. Integración nativa con Mercado Libre API. Contrato enterprise 3 años.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Proceso legal muy largo (6-12 meses). Requiere integración técnica profunda. Competidores con relaciones previas (Salesforce, HubSpot).' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Reunión ejecutiva con Marco (esta semana)\n2. Demo enterprise personalizada\n3. Propuesta de partnership estratégico\n4. Revisión legal (mes 2-3)\n5. Contrato 3 años' },
    ],
    edges: STANDARD_EDGES,
  },

  // ─── Lead 6: Perplexity AI ────────────────────────────────────────────────
  'lead-006': {
    leadId: 'lead-006',
    leadName: 'Luis Torres',
    company: 'Perplexity AI',
    score: 78,
    status: 'gold',
    aiAnalyzed: false,
    nodes: [
      { id: 'main', type: 'main', label: 'Perplexity AI', color: 'blue',
        content: 'Motor de búsqueda con IA. $500M+ en valoración. Expansión agresiva a LATAM en 2025. Equipo de ventas B2B en construcción.' },
      { id: 'who', type: 'concept', label: 'Decisores', color: 'purple',
        content: 'Luis Torres (Head of LATAM Expansion), Aravind Srinivas (CEO). Luis tiene presupuesto para herramientas de GTM en LATAM.' },
      { id: 'market', type: 'concept', label: 'Mercado', color: 'blue',
        content: 'IA para búsqueda y productividad. Mercado B2B: empresas tech, medios, educación. Competidores: Google, OpenAI, Bing AI.' },
      { id: 'gaps', type: 'concept', label: 'Gaps Identificados', color: 'amber',
        content: 'Sin estrategia GTM clara para LATAM. Equipo de ventas B2B recién formado (5 personas). Sin datos de mercado local ni partnerships.' },
      { id: 'opportunities', type: 'concept', label: 'Oportunidades GTM', color: 'green',
        content: 'GTM Radar para estrategia de entrada LATAM. Potencial $30,000/año. Identificación de partners estratégicos en 5 países.' },
      { id: 'strategy', type: 'concept', label: 'Estrategia', color: 'green',
        content: 'Posicionarse como partner de GTM para su expansión LATAM. Caso de uso: identificar 100 leads enterprise en 30 días. Demo con datos reales.' },
      { id: 'risks', type: 'concept', label: 'Riesgos', color: 'red',
        content: 'Empresa muy joven en LATAM, sin presupuesto definido. Decisiones se toman en USA. Proceso de aprobación lento por burocracia interna.' },
      { id: 'next', type: 'detail', label: 'Próximos Pasos', color: 'gray',
        content: '1. Demo con Luis + equipo LATAM (esta semana)\n2. Propuesta de piloto 30 días\n3. Caso de uso: 100 leads enterprise\n4. Presentación a CEO en USA\n5. Contrato anual' },
    ],
    edges: STANDARD_EDGES,
  },
};

// Posiciones de nodos en layout radial
export function getNodePositions(nodeCount: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  // Nodo principal en el centro
  positions.push({ x: 420, y: 300 });
  // Nodos secundarios en elipse alrededor del centro
  const radiusX = 320;
  const radiusY = 240;
  const count = nodeCount - 1;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    positions.push({
      x: 420 + radiusX * Math.cos(angle),
      y: 300 + radiusY * Math.sin(angle),
    });
  }
  return positions;
}

// Simula análisis de CrewAI (mock - para conectar con backend real)
export function simulateCrewAIAnalysis(leadId: string): Promise<Partial<LeadGraph>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const graph = LEAD_GRAPHS[leadId];
      if (!graph) { resolve({}); return; }
      // En producción: aquí iría la llamada al backend CrewAI
      // Por ahora retorna el grafo existente marcado como analizado
      resolve({
        aiAnalyzed: true,
        aiAnalyzing: false,
        nodes: graph.nodes.map((node) => ({
          ...node,
          content: node.id === 'strategy'
            ? `[Análisis IA] ${node.content}\n\n→ Recomendación: Priorizar contacto esta semana. Probabilidad de cierre: 78%.`
            : node.content,
        })),
      });
    }, 3000); // Simula 3 segundos de análisis
  });
}
