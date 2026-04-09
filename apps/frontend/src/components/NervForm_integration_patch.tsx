// ============================================================
// NervForm.tsx — Integration patch for VendorValidationScreen
// Apply these changes to your existing NervForm.tsx
// ============================================================

// ── 1. ADD IMPORT at the top of NervForm.tsx ────────────────
import VendorValidationScreen, { VendorData } from './VendorValidationScreen';
// (adjust path to match where you placed the component)

// ── 2. ADD SUPABASE CLIENT (if not already present) ─────────
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 3. ADD STATE inside your component function ──────────────
const [vendorData, setVendorData] = useState<VendorData | null>(null);
const [showVendorValidation, setShowVendorValidation] = useState(false);

// ── 4. ADD the lookup function inside your component ─────────
const checkVendorInSupabase = async (input: string) => {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length < 2) return;

  const { data, error } = await supabase
    .from('empresas_v3')
    .select('nombre, uvp, core, vertical, mercados_latam, killer_argument, strategic_hook, tier')
    .ilike('nombre', `%${trimmed}%`)
    .not('uvp', 'is', null)
    .limit(1)
    .single();

  if (!error && data) {
    setVendorData(data as VendorData);
    setShowVendorValidation(true);
  }
};

// ── 5. ADD onBlur to the empresa <input> ─────────────────────
// Find your empresa input and add:
//   onBlur={(e) => checkVendorInSupabase(e.target.value)}
//
// Example — before:
//   <input
//     type="text"
//     value={empresa}
//     onChange={(e) => setEmpresa(e.target.value)}
//     ...
//   />
//
// After:
//   <input
//     type="text"
//     value={empresa}
//     onChange={(e) => setEmpresa(e.target.value)}
//     onBlur={(e) => checkVendorInSupabase(e.target.value)}
//     ...
//   />

// ── 6. ADD VendorValidationScreen BEFORE your results div ────
// In your JSX return, before <div id="results"> or wherever
// results are rendered, insert:

{showVendorValidation && vendorData && (
  <VendorValidationScreen
    vendorData={vendorData}
    onConfirm={(confirmed) => {
      setVendorData(confirmed);
      setShowVendorValidation(false);
    }}
    onReject={() => {
      setVendorData(null);
      setShowVendorValidation(false);
    }}
  />
)}

// ── 7. INCLUDE vendor_data in your POST body ─────────────────
// Find the fetch/axios call where you POST form data and add
// vendor_data to the body:
//
// Before:
//   const body = {
//     empresa,
//     // ... other fields
//   };
//
// After:
//   const body = {
//     empresa,
//     // ... other fields
//     ...(vendorData ? { vendor_data: vendorData } : {}),
//   };
