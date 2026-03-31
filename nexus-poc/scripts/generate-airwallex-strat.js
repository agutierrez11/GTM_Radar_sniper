const http = require('http');

const data = JSON.stringify({
  brief: {
    empresa: "Airwallex Mexico",
    producto: "Plataforma unificada de pagos y finanzas (Cuentas globales + FX + SPEI)",
    pais: "Mexico",
    tier: "Tier1",
    target_account: "Nowports"
  },
  is_surgical: true
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/nexus',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log("🚀 Generando Muestra de Poder para Airwallex vs Nowports...");

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      console.log("✅ ESTRATEGIA GENERADA CON ÉXITO");
      console.log("-----------------------------------");
      console.log(parsed.markdown);
      console.log("-----------------------------------");
      console.log("Chain:", parsed.provider_chain);
    } catch (e) {
      console.log("❌ Error parseando respuesta:", responseData);
    }
  });
});

req.on('error', (e) => { console.error("❌ Error de conexión:", e.message); });
req.write(data);
req.end();
