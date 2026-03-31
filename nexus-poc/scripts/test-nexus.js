const http = require('http');

const data = JSON.stringify({
  brief: {
    empresa: "Valorenz",
    producto: "Crédito por libranza para pensionados",
    pais: "Colombia",
    tier: "Tier1"
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/nexus',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log("🚀 Enviando prueba a http://localhost:3000/api/nexus...");

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(responseData);
      console.log("✅ Respuesta recibida:", JSON.stringify(parsed, null, 2));
      if (parsed.provider_chain) {
        console.log("⛓️ Cadena de proveedores:", parsed.provider_chain);
      }
    } catch (e) {
      console.log("📄 Respuesta (no JSON):", responseData);
    }
  });
});

req.on('error', (error) => {
  console.error("❌ Error:", error.message);
});

req.write(data);
req.end();
