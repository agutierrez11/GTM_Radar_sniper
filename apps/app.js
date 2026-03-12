/**
 * ANTIGRAVITY SNIPER V16.2 | MASTER ENGINE
 * Command Architecture: Antonio Gutiérrez
 */

// GLOBAL ERROR CATCHER
window.onerror = function(msg, src, line, col, err) {
    const el = document.getElementById('system-alerts');
    if (el) el.textContent = `[JS_ERROR L${line}]: ${msg}`;
    console.error('[SNIPER_CRASH]:', msg, 'at line', line);
    return false;
};

// --- DATA ACCESS HELPERS ---
const getOperatorIntel = () => TITAN_INTEL[state.operator] || TITAN_INTEL['REGINA'];

const LABELS = {
    ES: {
        titan: 'TITANES', radar: '[RADAR_DE_CAZA]', report: '[DEJA_REPORTE_O_SUGERENCIAS]', wa: '[COMENTARIOS_WHATSAPP]',
        upsell: '[AARON_ROSS]: Upselling/Cross-selling...', flank: '[ESTRATEGIA]: Flanqueo...',
        placeholderComp: 'https://tuempresa.com', placeholderTarget: 'https://competencia.com',
        authError: '[ACCESS_DENIED]: Identidad no verificada.',
        narcissus: '[WARNING]: Narcismo detectado. No puedes atacarte a ti mismo.',
        noise: '[ERROR]: Vector no financiero. Sniper bloqueado.',
        loginAlert: (op) => `🚨 ALERTA: Titán [${op}] ha iniciado sesión en el Sniper.`,
        huntAlert: (op, target) => `🎯 CAZA: [${op}] está analizando a [${target}].`
    },
    EN: {
        titan: 'TITANS', radar: '[HUNT_RADAR]', report: '[LEAVE_REPORT_OR_SUGGESTIONS]', wa: '[WHATSAPP_COMMENTS]',
        upsell: '[AARON_ROSS]: Upselling/Cross-selling...', flank: '[STRATEGY]: Flanking...',
        placeholderComp: 'https://yourcompany.com', placeholderTarget: 'https://competitor.com',
        authError: '[ACCESS_DENIED]: Identity mismatch.',
        narcissus: '[WARNING]: Narcissus detected. Cannot attack self.',
        noise: '[ERROR]: Non-fintech vector. Sniper locked.',
        loginAlert: (op) => `🚨 ALERT: Titan [${op}] logged into Sniper.`,
        huntAlert: (op, target) => `🎯 HUNT: [${op}] is analyzing [${target}].`
    },
    PT: {
        titan: 'TITÃS', radar: '[RADAR_DE_CAÇA]', report: '[DEIXAR_RELATÓRIO_OU_SUGESTÕES]', wa: '[COMENTÁRIOS_WHATSAPP]',
        upsell: '[AARON_ROSS]: Recomendando Upselling...', flank: '[ESTRATÉGIA]: Flanqueamento...',
        placeholderComp: 'https://suaempresa.com', placeholderTarget: 'https://concorrente.com',
        authError: '[ACCESS_DENIED]: Identidade não verificada.',
        narcissus: '[WARNING]: Narcisismo detectado. Não pode atacar a si mesmo.',
        noise: '[ERROR]: Vetor não-fintech. Sniper bloqueado.',
        loginAlert: (op) => `🚨 ALERTA: Titã [${op}] iniciou sessão no Sniper.`,
        huntAlert: (op, target) => `🎯 CAÇA: [${op}] está analizando [${target}].`
    }
};

// --- PRE-VALIDATION ALPHA (ANTI-NOISE & ANTI-NARCISSUS) ---
function validateVector(compUrl, targetUrl) {
    if (compUrl === targetUrl) return { valid: False, msg: LABELS[state.lang].narcissus };
    
    const noiseKeywords = ['tortilleria', 'zapateria', 'panaderia', 'ferreteria', 'nails', 'hair', 'taco', 'pizzeria', 'pasteleria', 'mecanico'];
    const isNoise = noiseKeywords.some(kw => compUrl.includes(kw) || targetUrl.includes(kw));
    
    if (isNoise) return { valid: false, msg: LABELS[state.lang].noise };
    
    return { valid: true };
}

// --- MASTER RADAR HUNT MOTOR V17.0 ---
window.radarHunt = async function() {
    if (!state.operator) {
        alert('ERROR: Identidad requerida.');
        return;
    }

    const compInput = document.getElementById('company-url-input');
    const targetInput = document.getElementById('target-url-input');
    const icpInput = document.getElementById('icp-input');
    const statusEl = document.getElementById('engine-status');

    let compUrl = compInput ? compInput.value.trim().toLowerCase() : '';
    let targetUrl = targetInput ? targetInput.value.trim().toLowerCase() : '';
    let icpQuery = icpInput ? icpInput.value.trim() : '';

    const labels = LABELS[state.lang];

    if (!compUrl || !targetUrl) {
        if (statusEl) {
            statusEl.textContent = 'ERR: DATA_REQUIRED';
            statusEl.style.color = 'red';
        }
        return;
    }

    // --- WOW VALIDATION LAYER ---
    const validation = validateVector(compUrl, targetUrl);
    if (!validation.valid) {
        alert(validation.msg);
        if (statusEl) statusEl.textContent = 'VECTOR_BLOCKED';
        return;
    }

    if (statusEl) {
        statusEl.textContent = 'ANALYZING_STRATEGIC_FIT...';
        statusEl.classList.add('blink');
    }

    // Clean URLs
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    if (!compUrl.startsWith('http')) compUrl = 'https://' + compUrl;

    let targetHostname = 'UNKNOWN';
    try { targetHostname = new URL(targetUrl).hostname.replace('www.', ''); }
    catch(e) { targetHostname = targetUrl.split('/')[0]; }

    // 1. SCRAPE & INTELLIGENCE
    if (statusEl) statusEl.textContent = 'EXTRACTING_COMPETITIVE_INTEL...';
    const intelPayload = await firecrawlFetch(targetUrl);

    // 2. GENERATE BATTLE CARDS
    const context = getOperatorIntel();
    const battleCards = generateBattleCards(intelPayload, context, compUrl);
    
    // Inject ICP intel if exists
    if (icpQuery) {
        battleCards.ICP_Focus = icpQuery;
        console.log(`[ICP_INTEL]: Targetting ${icpQuery} for ${targetHostname}`);
    }

    // 3. PERSIST & PACKAGE
    const newEntry = {
        id: `STRAT-${Date.now().toString().slice(-4)}`,
        company: targetHostname.toUpperCase(),
        url: targetUrl,
        category: 'FINTECH_STRATEGY',
        status: 'VERIFIED',
        content: intelPayload.content,
        battleCards: battleCards,
        isNew: true
    };

    INTEL_DATA.unshift(newEntry);
    state.hasHunted = true;
    
    renderFeed();
    if (statusEl) {
        statusEl.textContent = 'STRATEGIC_DOSSIER_READY';
        statusEl.classList.remove('blink');
    }
    
    setTimeout(() => openProxyModal(newEntry.id), 500);
};

async function firecrawlFetch(url) {
    const apiKey = SCRAPER_POOL[0].key; 
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ url: url, formats: ['markdown'], onlyMainContent: true })
        });
        const data = await response.json();
        if (data.success) {
            return {
                source: 'FIRECRAWL_LIVE',
                content: data.data.markdown,
                hostname: new URL(url).hostname
            };
        }
        throw new Error('Firecrawl failed');
    } catch (e) {
        console.error("[SCRAPE_ERROR]:", e);
        return {
            source: 'SCRAPE_FAILED_FALLBACK',
            content: `# 🔴 Error al extraer datos de ${url}\nEl sistema no pudo acceder al sitio.`,
            hostname: url
        };
    }
}

function generateBattleCards(intel, context, compUrl) {
    const isClient = intel.content.toLowerCase().includes(context.myCompany.toLowerCase());
    const lang = state.lang;
    
    const translate = (es, en, pt) => ({ ES: es, EN: en, PT: pt }[lang]);

    return {
        MEDDIC: translate(
            `**Metrics**: Eficiencia operativa del 15%.\n**Champion**: Líder de Compliance.`,
            `**Metrics**: 15% operational efficiency boost.\n**Champion**: Compliance Lead.`,
            `**Metrics**: Eficiência operacional de 15%.\n**Champion**: Líder de Compliance.`
        ),
        SPIN: translate(
            `**Situation**: Procesos manuales.\n**Need-payoff**: Integración de ${context.myCompany}.`,
            `**Situation**: Manual processes.\n**Need-payoff**: ${context.myCompany} integration.`,
            `**Situation**: Processos manuais.\n**Need-payoff**: Integração da ${context.myCompany}.`
        ),
        BANT: translate(
            `**Budget**: $20k-$50k USD.\n**Timeline**: Q3 2026.`,
            `**Budget**: $20k-$50k USD.\n**Timeline**: Q3 2026.`,
            `**Budget**: $20k-$50k USD.\n**Timeline**: Q3 2026.`
        ),
        AaronRoss: translate(
            `**Seeds**: Referido BTG/Itaú.`,
            `**Seeds**: BTG/Itaú referral.`,
            `**Seeds**: Referência BTG/Itaú.`
        ),
        OceanoAzul: translate(
            `**Reducir**: Tiempos de soporte.`,
            `**Reduce**: Support response times.`,
            `**Reduzir**: Tempo de suporte.`
        ),
        Flanqueo: translate(
            `**Vector**: ${context.regions ? context.regions[0] : 'Global'}.\n**Ataque**: Velocidad vs competencia.`,
            `**Vector**: ${context.regions ? context.regions[0] : 'Global'}.\n**Attack**: Speed vs competitors.`,
            `**Vetor**: ${context.regions ? context.regions[0] : 'Global'}.\n**Ataque**: Velocidade vs concorrência.`
        ),
        Schwerpunkt: translate(
            `Foco: Reducción de abandono digital.`,
            `Focus: Digital bounce rate reduction.`,
            `Foco: Redução de abandono digital.`
        ),
        ShadowOps: translate(
            `**Reddit**: Quejas por APIs caídas.`,
            `**Reddit**: API downtime complaints.`,
            `**Reddit**: Reclamações de API caída.`
        ),
        Prospects: context.topProspects ? context.topProspects.slice(0, 10) : [],
        Context: context,
        isClient: isClient
    };
}

// --- CORE LOGIC & UI ---
// --- PERSISTENCE & SECRETS (Vercel Ready) ---
const WEBHOOK_CONFIG = {
    ENABLED: true,
    // Estos valores se inyectarán en Vercel Dashboard para seguridad
    SUPABASE_URL: window.location.hostname === 'localhost' ? '' : 'https://vstmsndpxmxhkcllypxr.supabase.co',
    SUPABASE_KEY: '', // Inyectado vía ENV
    URL: 'https://hooks.slack.com/services/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',
    TELEGRAM: {
        ENABLED: true,
        TOKEN: '7233842845:AAFInGle_5E0U89_A3E1S1yO5E0U89_A3E1', 
        CHAT_ID: '7233842845' 
    }
};

const SCRAPER_POOL = [{ provider: 'Firecrawl_05', key: 'fc-0e246d8f705c49c9b6ae137311aacd8f', weight: 40, status: 'ONLINE' }];
const WHITELIST = ['ANTONIO', 'NATELLA', 'GABRIEL', 'XAVIER', 'EDSON', 'ALEJANDRO', 'ANASTASIA', 'DANIEL', 'REGINA'];

let state = {
    operator: null,
    isShadow: false,
    lang: 'ES',
    geo: { country: 'SCANNING', city: 'DETECTION', ip: '0.0.0.0' },
    domainsMap: new Set(),
    hasHunted: false
};

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    detectGeo();
    initInteraction();
});

function initAuth() {
    const loginInput = document.getElementById('operator-id');
    if (loginInput) {
        loginInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') validateLogin(loginInput.value.toUpperCase().trim());
        });
    }
}

function validateLogin(val) {
    if (WHITELIST.includes(val)) {
        state.operator = val;
        bootSystem();
        sendGhostAlert(LABELS[state.lang].loginAlert(val), 'ALERTS');
    } else if (val.startsWith('ANTONIO_AS_')) {
        state.operator = val.replace('ANTONIO_AS_', '');
        state.isShadow = true;
        bootSystem();
        sendGhostAlert(`🕵️ SHADOW_MODE: Antonio as [${state.operator}]`, 'ALERTS');
    } else {
        const err = document.getElementById('auth-error');
        if (err) {
            err.textContent = LABELS[state.lang].authError;
            err.classList.remove('hidden');
        }
    }
}

function bootSystem() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    updateBranding();
    startClocks();
    startHeartbeatLoop();
    renderFeed();
    initRadarButton();
    if (state.isShadow) document.getElementById('shadow-indicator').classList.remove('hidden');
}

function renderFeed() {
    const feed = document.getElementById('intel-feed');
    if (!feed) return;
    
    feed.innerHTML = ''; // Clear for re-render
    
    if (!state.hasHunted && INTEL_DATA.length <= 1) {
        feed.innerHTML = `
            <div class="waiting-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--accent-color); opacity: 0.7;">
                <div class="blink">>>> INGRESA VECTOR ESTRATÉGICO PARA GENERAR BATTLECARDS...</div>
            </div>
        `;
        return;
    }

    // SaaS Layout: Show only the last 5 relevant leads as a "Strategic Package"
    const sessionPackage = INTEL_DATA.slice(0, 5);
    
    sessionPackage.forEach(item => {
        const card = document.createElement('div');
        card.className = `intel-card ${item.isNew ? 'glow-new' : ''}`;
        
        card.innerHTML = `
            <div onclick="openProxyModal('${item.id}')">
                <div class="card-header">
                    <span class="status-led green"></span>
                    <span>${item.company}</span>
                </div>
                <div class="card-content-md">
                    ${sanitize(item.content.substring(0, 120))}...
                </div>
            </div>
            <div class="card-footer-strat">
                <div style="display:flex; justify-content: space-between; align-items: center;">
                    <span>${item.category}</span>
                    <button class="cyber-btn-mini" style="font-size: 0.6rem; padding: 4px 8px;" onclick="markAsClient('${item.id}')">ES MI CLIENTE</button>
                </div>
            </div>
        `;
        feed.appendChild(card);
    });
}

window.markAsClient = async function(id) {
    const item = INTEL_DATA.find(i => i.id === id);
    if (item) {
        item.status = 'CLIENT_CONFIRMED';
        
        // Persistencia en Supabase si es del Harvest
        if (id.startsWith('HARVEST-')) {
            const dbId = id.split('-')[1];
            try {
                await fetch(`${WEBHOOK_CONFIG.SUPABASE_URL}/rest/v1/empresas?id=eq.${dbId}`, {
                    method: 'PATCH',
                    headers: {
                        "apikey": WEBHOOK_CONFIG.SUPABASE_KEY,
                        "Authorization": `Bearer ${WEBHOOK_CONFIG.SUPABASE_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status: 'CLIENT_CONFIRMED' })
                });
            } catch (e) { console.error("Persistence error:", e); }
        }

        alert(`Autoridad confirmada: ${item.company} marcado como cliente en tu base estratégica.`);
        renderFeed();
        sendGhostAlert(`[CONVERSION] ${state.operator}: Lead ${item.company} marcado como CLIENTE.`, 'SUCCESS');
    }
};

function openProxyModal(id) {
    const item = INTEL_DATA.find(i => i.id === id);
    if (!item) return;

    const body = document.getElementById('modal-body');
    if (!body) return;

    const bc = item.battleCards || generateBattleCards({content: item.content}, getOperatorIntel(), '');

    let bcHtml = `
        <div class="battlecard-container">
            <div class="bc-grid">
                <div class="bc-section"><h4>MEDDIC</h4><p>${bc.MEDDIC}</p></div>
                <div class="bc-section"><h4>SPIN</h4><p>${bc.SPIN}</p></div>
                <div class="bc-section"><h4>BANT</h4><p>${bc.BANT}</p></div>
                <div class="bc-section"><h4>AARON ROSS</h4><p>${bc.AaronRoss}</p></div>
                <div class="bc-section"><h4>OCÉANO AZUL</h4><p>${bc.OceanoAzul}</p></div>
                <div class="bc-section"><h4>FLANQUEO</h4><p>${bc.Flanqueo}</p></div>
                <div class="bc-section"><h4>SCHWERPUNKT</h4><p>${bc.Schwerpunkt}</p></div>
                <div class="bc-section"><h4>SHADOW OPS</h4><p>${bc.ShadowOps}</p></div>
            </div>
        </div>
        <hr>
        <div class="prospects-section">
            <h4>🏆 TOP 10 PROSPECTOS PARA ${state.operator}</h4>
            <div class="prospects-grid">
                ${bc.Prospects && bc.Prospects.length > 0 ? bc.Prospects.map(p => `<div class="prospect-pill">${p}</div>`).join('') : '<p>No prospects pre-loaded.</p>'}
            </div>
        </div>
        <hr>
        <div class="raw-content">
            <h4>RAW INTEL</h4>
            ${sanitize(item.content)}
        </div>
    `;

    body.innerHTML = `
        <div class="modal-header-intel">
            <h2>${item.company}</h2>
            <span>${item.category}</span>
        </div>
        ${bcHtml}
    `;
    
    document.getElementById('battlecard-feedback').classList.remove('hidden');
    toggleModal('detail-modal', true);
}

function sanitize(text) {
    let clean = text.replace(/(C:\\Users|ghp_|linkedin_token)/gi, "[SECURED]");
    clean = clean.replace(/\[\[(.*?)\]\]/g, '<span class="wiki-link">$1</span>');
    clean = clean.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    clean = clean.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    clean = clean.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    clean = clean.replace(/^\* (.*$)/gim, '<li>$1</li>');
    clean = clean.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    return clean;
}

function toggleModal(id, show) {
    const m = document.getElementById(id);
    if (!m) return;
    if (show) m.classList.remove('hidden');
    else m.classList.add('hidden');
}

function startClocks() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock-cancun').textContent = `BASE (CANCUN): ${now.toLocaleTimeString()}`;
        document.getElementById('clock-titan').textContent = `${state.operator}_NODE: ${now.toLocaleTimeString()}`;
        document.getElementById('live-time').textContent = now.toLocaleTimeString();
    }, 1000);
}

function startHeartbeatLoop() {
    setInterval(() => {
        const r = document.getElementById('ready-count');
        if (r) r.textContent = (parseInt(r.textContent) + (Math.random() > 0.9 ? 1 : 0));
    }, 5000);
}

function initRadarButton() {
    const rb = document.getElementById('radar-hunt-btn');
    if (rb) rb.onclick = () => window.radarHunt();
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = () => toggleModal('detail-modal', false);
}

function detectGeo() {
    state.geo = { ip: '189.215.10.42', city: 'CANCÚN', country: 'MX' };
    document.getElementById('guest-ip').textContent = state.geo.ip;
    document.getElementById('guest-loc').textContent = `${state.geo.city}, ${state.geo.country}`;
}

function updateBranding() {
    const l = LABELS[state.lang];
    document.getElementById('operator-display').textContent = `OPERATOR: [${state.operator}]`;
    document.getElementById('radar-hunt-btn').textContent = l.radar;
    document.getElementById('watermark').textContent = `CONFIDENTIAL FOR ${state.operator}`;
}

function setLanguage(lang) {
    state.lang = lang;
    updateBranding();
    renderFeed();
}

function initInteraction() {
    document.getElementById('contact-strategist-btn').onclick = () => window.open('https://wa.me/529981191903', '_blank');
}

// --- STRATEGIC PACKAGING & HARVEST ACCESS ---
window.loadHarvestBlock = async function() {
    const statusEl = document.getElementById('engine-status');
    if (statusEl) statusEl.textContent = 'FETCHING_HARVEST_BLOCK...';
    
    // En un entorno SaaS real, esto llamaría a Supabase vía REST
    // Aquí simularemos el "Wow" cargando 5 de los 22k que ya tienen descripción
    try {
        const url = `${WEBHOOK_CONFIG.SUPABASE_URL}/rest/v1/empresas?description=not.is.null&select=*&limit=5`;
        const r = await fetch(url, {
            headers: {
                "apikey": WEBHOOK_CONFIG.SUPABASE_KEY,
                "Authorization": `Bearer ${WEBHOOK_CONFIG.SUPABASE_KEY}`
            }
        });
        const data = await r.json();
        
        if (data && data.length > 0) {
            data.forEach(item => {
                const entry = {
                    id: `HARVEST-${item.id}`,
                    company: item.name.toUpperCase(),
                    url: item.website,
                    category: 'HARVESTED_INTEL',
                    status: 'VERIFIED',
                    content: item.description,
                    battleCards: generateBattleCards({content: item.description}, getOperatorIntel(), '')
                };
                INTEL_DATA.unshift(entry);
            });
            state.hasHunted = true;
            renderFeed();
            if (statusEl) statusEl.textContent = 'PACKAGE_OF_5_READY';
        }
    } catch (e) {
        console.error("Harvest error:", e);
        if (statusEl) statusEl.textContent = 'ERR: HARVEST_ACCESS_DENIED';
    }
};

window.toggleStrategicMap = function() {
    const map = document.getElementById('tactical-map');
    map.classList.toggle('hidden');
    if (!map.classList.contains('hidden')) initStrategicGraph();
};

function initStrategicGraph() {
    const container = document.getElementById('map-svg-container');
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--accent-color);">GENERANDO RED DE RELACIONES (OBSIDIAN MODE)...</div>';
    
    // Simulación de grafo interconectado
    setTimeout(() => {
        container.innerHTML = `
            <svg width="100%" height="300" style="border: 1px solid var(--border-color); border-radius: 8px;">
                <circle cx="50%" cy="50%" r="40" fill="var(--secondary-accent)" opacity="0.4" />
                <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="12">TU EMPRESA</text>
                
                <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="var(--accent-color)" stroke-dasharray="5,5" />
                <circle cx="30%" cy="30%" r="30" fill="var(--warning-color)" opacity="0.3" />
                <text x="30%" y="30%" text-anchor="middle" fill="white" font-size="10">COMPETIDOR</text>
                
                <line x1="50%" y1="50%" x2="70%" y2="40%" stroke="var(--accent-color)" />
                <circle cx="70%" cy="40%" r="20" fill="var(--accent-color)" opacity="0.3" />
                <text x="70%" y="40%" text-anchor="middle" fill="white" font-size="10">LEAD 1</text>
            </svg>
        `;
    }, 1500);
}
