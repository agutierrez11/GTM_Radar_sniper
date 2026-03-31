// Using native fetch in Node 24

async function testTriModel() {
  console.log("🚀 TEST NEUTRAL DE CADENA TRI-MODELO (NERV)...");
  
  const payload = {
    brief: {
      empresa: "Nuvei",
      producto: "Orquestación de pagos y adquirencia local",
      pais: "México",
      vertical: "Payments & Remittances",
      buyer: "CTO de Retailer Grande",
      tier: "Tier1"
    },
    is_surgical: false
  };

  try {
    const res = await fetch('http://localhost:3000/api/nexus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("\n📊 RESULTADO:");
    console.log(`- Provider Chain: ${data.provider_chain}`);
    console.log(`- Latido: ${data.latido_mercado?.substring(0, 50)}...`);
    console.log(`- Diagnóstico: ${data.diagnostico?.resfriado}`);
    
    if (data.provider_chain?.includes('deepseek')) {
      console.log("✅ DEEPSEEK INTEGRADO EXITOSAMENTE.");
    } else {
      console.warn("⚠️ DEEPSEEK NO DETECTADO EN LA CADENA (Posible error de saldo o fallback).");
    }
  } catch (err) {
    console.error("❌ ERROR EN EL TEST:", err.message);
  }
}

testTriModel();
