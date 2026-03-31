const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Find Lounn by id 483 AND 2420 — use whichever matches
  const { data } = await sb.from('empresas_v2')
    .select('id, name, signal_context, strategic_notes')
    .or('id.eq.483,id.eq.2420');

  const lounn = data?.find(r => r.name?.toLowerCase().includes('lounn'));
  if (!lounn) { console.log('Lounn no encontrado'); return; }
  console.log('Lounn encontrado — id:', lounn.id, '| name:', lounn.name);

  // 2. Añadir nota a strategic_notes (convención: nota sin URL verificable = strategic_notes)
  const nota = '[LinkedIn 2026-03-19 — no verificada por RaiSE] Lounn anuncia alianza con Finkargo para financiamiento de importaciones PyME: "Hoy nos aliamos con Finkargo para abrir una nueva forma de financiar importaciones. Importa más, sin descapitalizarte."';
  const notasActuales = lounn.strategic_notes ? lounn.strategic_notes + '\n\n' + nota : nota;

  const { error } = await sb.from('empresas_v2')
    .update({ strategic_notes: notasActuales })
    .eq('id', lounn.id);

  if (error) console.error('Error Lounn:', error.message);
  else console.log('Lounn (id ' + lounn.id + ') — nota guardada en strategic_notes OK');
}

run();
