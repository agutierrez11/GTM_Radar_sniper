async function testSwarm() {
  const brief = {
    empresa: "Koin",
    producto: "Antifraude para iGaming",
    pais: "México",
    vertical: "Payments & Remittances",
    tier: "Tier1"
  };

  console.log("🚀 Probando Enjambre NERV (RaiSE v3.1)...");
  
  try {
    const response = await fetch("https://nexus-poc.vercel.app/api/nexus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, isForensic: true })
    });

    const data = await response.json();
    console.log("✅ Enjambre Respondió con Éxito!");
    console.log("--- RESULTADOS ---");
    console.log("Latido del Mercado:", data.latido_mercado);
    console.log("Inferencia RaiSE:", data.analisis_forense.inferencia_raise);
    console.log("Resumen del Enjambre:", data.auditoria.resumen_enjambre);
  } catch (error) {
    console.error("❌ Falló la prueba del enjambre:", error);
  }
}

testSwarm();
