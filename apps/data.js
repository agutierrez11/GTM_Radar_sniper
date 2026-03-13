const INTEL_SNIPPETS = {
    // ⚔️ GTM WAR CHEST: COMPARATIVE KILL-SHOTS
    "Apollo.md": `# [KILL-SHOT]: Apollo.io\n**Debilidad**: Fragmentación de data y falta de orquestación inbound.\n**Ataque**: "Apollo te da leads, pero nosotros te damos el sistema circulatorio para cerrarlos."`,
    "ZoomInfo.md": `# [KILL-SHOT]: ZoomInfo\n**Debilidad**: Costo prohibitivo y data estática.\n**Ataque**: "Estás pagando por un directorio; con nosotros pagas por una infraestructura de ingresos engineered."`,
    "Mutiny.md": `# [KILL-SHOT]: Mutiny\n**Debilidad**: Curva de aprendizaje alta y dependencia de IT.\n**Ataque**: "Nuestra plataforma No-Code te da el poder de Mutiny sin el dolor de cabeza de implementación."`,
    "Default.md": `# [STRATEGY]: Inbound Orchestration\n**Concepto**: Unificar enrichment, routing y scheduling.\n**Uso**: "No multipliques herramientas, unifica el sistema."`,

    // 🎯 ABM & PERSON-BASED PRECISION (Influ2/Wynter Style)
    "Influ2_PBA.md": `# [TACTIC]: Person-Based Advertising (PBA)\n**Concepto**: No ataques a la empresa, ataca al nombre.\n**Acción**: Mostrar ads específicos al Economic Buyer (CTO/CEO) antes del primer touch Sales.`,
    "Wynter_Messaging.md": `# [TACTIC]: Messaging Audit\n**Concepto**: Validar si el prospecto entiende tu propuesta en < 5 seg.\n**Acción**: Testear el 'Kill-Shot' contra paneles de audiencia real.`,
    "Sparktoro_Intel.md": `# [TACTIC]: Audience Recon\n**Concepto**: ¿Dónde consume info tu cliente?\n**Acción**: Identificar qué podcasts y newsletters sigue el prospecto para flanquear con contenido.`,

    // 🗺️ REGIONAL CONTEXT (GEO-PRECISION)
    "Mexico_Deep.md": `# 🇲🇽 México: Guerra de Identidad\n**Dolor**: 45% abandono en validación INE/CURP.\n**Kill-Shot**: Onboarding 100% sin documentos vía Gov-API.`,
    "Brazil_Deep.md": `# 🇧🇷 Brasil: El Asalto de Deepfakes\n**Dolor**: Robo de identidad en flujos PIX (+800%).\n**Kill-Shot**: Biometría Liveness 3D con defensa de inyección nivel militar.`,
    "Colombia_Deep.md": `# 🇨🇴 Colombia: Fricción Registraduría\n**Dolor**: Caída de conversión por procesos manuales.\n**Kill-Shot**: Orquestación multi-fuente para KYB express.`,

    // ⚡ ACTIONABLE CLOSING TEMPLATES (4-STRIKES)
    "Strike_Template.md": `### [STRIKE_01]: KILL-SHOT\n>> {argumento_descalificador}\n\n### [STRIKE_02]: 4_PREGUNTAS_SPIN\n1. {pregunta_situacion}\n2. {pregunta_problema}\n3. {pregunta_implicacion}\n4. {pregunta_necesidad}\n\n### [STRIKE_03]: BRECHA_TEC\n- Rival: {debilidad_rival}\n- Nosotros + {multiplier}: {ventaja_unificada}\n\n### [STRIKE_04]: MANIOBRA_AVANZADA\n>> {insight_tactico}`
};

const TITAN_INTEL = {
    'ANASTASIA': {
        myCompany: 'OPERACIÓN_VARSOVIA',
        myUrl: 'operator.ia',
        myCategory: 'Global Intelligence',
        myKillShot: 'Soberanía de datos en mercados de alta fricción.',
        competitors: ['Legacy_Silos'],
        regions: ['Europa', 'Latam'],
        topProspects: ['Fintech_Unicorns']
    },
    'ANTONIO': {
        myCompany: 'NERV_SOLUTIONS',
        myUrl: 'nerv.hq',
        myCategory: 'Closing Orchestration',
        myKillShot: 'Revenue Engineering for high-stakes deal closure.',
        competitors: ['Manual_Workflows'],
        regions: ['Global'],
        topProspects: ['Enterprise_Tier_1']
    }
};

const INTEL_DATA = [
    {
        id: 'INIT-1',
        client: 'RADAR_LATAM',
        competitor: 'LEGACY_SYSTEMS',
        country: '🌎 GLOBAL',
        isNew: false,
        matrix: {
            prospecto: { name: 'RADAR_LATAM', pain: 'Fragmentación de datos regionales' },
            competidor: { name: 'LEGACY', weakness: 'Rigidez Geográfica' },
            estrategia: { title: "VENTAJA", value: 'Orquestación Unificada' }
        },
        content: `### [STRIKE_01]: KILL-SHOT\n>> "El problema no es la data, es el silo."\n\n### [STRIKE_02]: 4_PREGUNTAS_SPIN\n1. ¿Cuántos proveedores usas hoy?\n2. ¿Quién orquesta el flujo?\n\n${INTEL_SNIPPETS["Mexico_Deep.md"]}`,
        battleCards: { REG: 'VARIOUS', STATUS: 'MONITORING', MULTIPLIER: 'DIRECT' },
        company: 'RADAR_LATAM'
    }
];
