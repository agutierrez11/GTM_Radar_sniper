const state = {
    operator: 'ANTONIO',
    diamonds: 2797,
    isShadow: true,
    currentLead: null
};

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initRadar();
    fetchDiamonds();
});

function handleLogin() {
    const code = document.getElementById('operator-id').value.toUpperCase();
    if (code === 'NERV' || code === 'ANTONIO' || code === 'TITAN' || code === '') {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
    } else {
        document.getElementById('auth-error').classList.remove('hidden');
    }
}

function initClock() {
    setInterval(() => {
        document.getElementById('live-time').innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
    }, 1000);
}

function initRadar() {
    const btn = document.getElementById('radar-hunt-btn');
    if (btn) {
        btn.onclick = () => {
            const target = document.getElementById('icp-input').value;
            if (!target) return alert('Por favor ingresa un TARGET_PROSPECT');
            runRadarSimulation(target);
        };
    }
}

async function fetchDiamonds() {
    const url = "https://bwbatonvkfcjkfvhcwtc.supabase.co/rest/v1/empresas?status=eq.ENRIQUECIDO&limit=24&order=last_scan.desc";
    const key = "sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74";
    try {
        const r = await fetch(url, { headers: { "apikey": key, "Authorization": `Bearer ${key}` } });
        const data = await r.json();
        renderFeed(data);
    } catch (e) {
        console.error("Data fetch error", e);
    }
}

function renderFeed(data) {
    const feed = document.getElementById('intel-feed');
    if (!feed) return;
    feed.innerHTML = '';
    
    data.forEach(item => {
        let strat = { pain_point: 'Strategic Intel Pending' };
        try { strat = JSON.parse(item.description); } catch(e) {}
        
        const card = document.createElement('div');
        card.className = 'intel-card';
        card.innerHTML = `
            <div class="name">${item.name}</div>
            <div class="pain">${strat.pain_point || item.description || 'No data'}</div>
            <div class="tag">💎 DIAMOND</div>
        `;
        card.onclick = () => openDiamondModal(item, strat);
        feed.appendChild(card);
    });
}

function openDiamondModal(item, strat) {
    state.currentLead = item;
    document.getElementById('modal-lead-id').innerText = `ID_${item.id || 'SNIPER'}`;
    renderStrategyTab('triangulation', strat);
    document.getElementById('proxy-modal').style.display = 'flex';
}

function renderStrategyTab(tab, strategy) {
    const content = document.getElementById('modal-content-area');
    let html = '';
    
    if (tab === 'triangulation') {
        html = `<div class="strat-view">
            <h3>ACCOUNT_TRIANGULATION</h3>
            <p><strong>Primary Pain:</strong> ${strategy.pain_point || 'N/A'}</p>
            <p><strong>Country Context:</strong> ${strategy.country_context || 'LATAM'}</p>
            <div class="kill-shot">"${strategy.kill_shot || 'Target neutralized'}"</div>
        </div>`;
    }
    // Add other tabs as needed...
    content.innerHTML = html;
}

function closeProxyModal() {
    document.getElementById('proxy-modal').style.display = 'none';
}

function runRadarSimulation(target) {
    console.log("Hunting target:", target);
    alert('HUNT_RADAR_ACTIVE: Processing target ' + target);
}
