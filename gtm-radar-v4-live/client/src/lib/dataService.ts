import { supabase } from './supabaseClient';
import { BattleCard, LeadBattleCards } from './battleCardData';
import { LeadGraph, LeadNode, STANDARD_EDGES } from './graphData';

export async function fetchLiveLeads() {
    const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('last_scan', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
    return data;
}

export async function fetchLeadById(id: string) {
    const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching lead by id:', error);
        return null;
    }
    return data;
}

export function mapToBattleCards(lead: any): LeadBattleCards {
    const sector = lead.sector || 'Strategic Lead';
    return {
        leadId: lead.id.toString(),
        company: lead.name,
        contact: 'Analizado por NERV',
        role: sector,
        cards: [
            {
                id: 'company',
                type: 'company',
                title: 'La Empresa / Insight',
                icon: '🏢',
                accentColor: '#378ADD',
                content: [
                    lead.description || 'Sin descripción disponible.',
                    `Sector: ${sector}`,
                    `Potencial Infra: ${lead.infra_potential ? 'ALTO' : 'Bajo'}`,
                    `Último Análisis: ${new Date(lead.last_scan).toLocaleDateString()}`
                ],
                tip: 'Este insight fue extraído mediante la red Quirúrgica de NERV.'
            },
            {
                id: 'strategy',
                type: 'script',
                title: 'Heurística NERV',
                icon: '📞',
                accentColor: '#14b8a6',
                content: [
                    'PITCH: Enfocarse en la disrupción de infraestructura.',
                    `HOOK: "Dada la importancia de ${sector} en LATAM..."`,
                    'VALOR: NERV reduce el tiempo de venta de meses a horas.'
                ],
                tip: 'Usa el ángulo de "Speed to Lead" para cerrar la llamada.'
            },
            {
                id: 'pain',
                type: 'pain',
                title: 'Dolor Industrial',
                icon: '⚡',
                accentColor: '#f59e0b',
                content: [
                    'Fricción en el onboarding de rieles legacy.',
                    'Falta de visibilidad en transacciones A2A.',
                    'Costos elevados de mediación bancaria.'
                ],
                tip: 'Pregunta: "¿Cuánto les cuesta el settlement manual hoy?"'
            }
        ]
    };
}

export function mapToGraph(lead: any): LeadGraph {
    const nodes: LeadNode[] = [
        { id: 'main', type: 'main', label: lead.name, color: 'blue', content: lead.description },
        { id: 'market', type: 'concept', label: 'Ecosistema', color: 'purple', content: lead.sector || 'Fintech/Payments' },
        { id: 'gaps', type: 'concept', label: 'Oportunidad', color: 'amber', content: 'Disrupción detectada vía Flagship/Bloque.' },
        { id: 'strategy', type: 'concept', label: 'Estrategia NERV', color: 'green', content: 'Despliegue quirúrgico de Battle Cards v4.' }
    ];

    return {
        leadId: lead.id.toString(),
        leadName: lead.name,
        company: lead.name,
        score: lead.infra_potential ? 95 : 70,
        status: lead.infra_potential ? 'gold' : 'silver',
        aiAnalyzed: true,
        nodes,
        edges: [
            { id: 'e1', source: 'main', target: 'market', label: 'Opera en' },
            { id: 'e2', source: 'market', target: 'gaps', label: 'Genera' },
            { id: 'e3', source: 'gaps', target: 'strategy', label: 'Activa' }
        ]
    };
}
