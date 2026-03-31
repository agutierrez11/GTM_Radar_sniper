import fs from 'fs';
import path from 'path';

export function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/^export /i, '');
        const value = parts.slice(1).join('=').trim().replace(/^"|^'|\"$|'$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
    console.log("✅ Environment loaded from .env.local");
  } else {
    console.warn("⚠️ .env.local not found");
  }
}

loadEnv();
