require('dotenv').config({ path: 'C:\\Users\\Antonio\\Desktop\\.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const companies = [
  {
    nombre: "Stake",
    uvp: "Crypto-native casino and sportsbook offering provably fair games, zero-fee crypto deposits, and instant withdrawals with a transparent on-chain model.",
    core: "Peer-to-peer crypto gambling platform offering casino games, sports betting, and esports wagering to a global audience.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Argentina","Colombia","Chile","Perú"],
    killer_argument: "Despite being crypto-first, a significant share of LATAM players cannot or will not use crypto — they want to fund their accounts via PIX, OXXO, or SPEI. Every time a Brazilian player hits a failed PIX deposit or gets stuck in a KYC loop trying to convert BRL to USDT, Stake loses that session permanently to a competitor who accepts local rails. Crypto volatility also erodes player balances between deposit and first bet, generating support tickets and churn.",
    strategic_hook: "What percentage of your LATAM deposit attempts fail because the player cannot bridge from local currency to crypto — and how much GGR are you attributing to that gap today?",
    tier: "Tier 1",
    tier_razon: "One of the highest-volume crypto casinos globally; LATAM is a major growth market but local payment friction limits fiat-to-crypto conversion at scale.",
    website: "https://stake.com",
    pais_hq: "Curazao"
  },
  {
    nombre: "Codere",
    uvp: "Established omnichannel betting operator with deep retail roots in Spain and LATAM, offering sports betting, slots, and live casino across web, app, and physical betting shops.",
    core: "Licensed sports betting and casino operator with a hybrid retail-digital model, focusing on regulated LATAM markets including Mexico, Colombia, Argentina, and Panama.",
    vertical: "iGaming",
    mercados_latam: ["México","Colombia","Argentina","Panamá","Uruguay"],
    killer_argument: "Codere operates in some of the most complex regulatory environments in LATAM where payment processor relationships are fragile — local acquiring banks frequently de-risk iGaming merchants, triggering sudden declines. In Mexico, SPEI chargebacks and OXXO cash reconciliation delays create float and fraud exposure. In Argentina, FX controls mean players pay in ARS but the company reports in EUR, creating treasury nightmares. Each regulatory change requires rebuilding payment flows from scratch.",
    strategic_hook: "When a local acquiring bank in Mexico or Colombia suddenly drops iGaming as an MCC, how long does it take your team to restore full payment coverage — and what is the revenue loss per day of degraded checkout?",
    tier: "Tier 1",
    tier_razon: "Major regulated LATAM operator with physical and digital presence; high transaction volume across multiple regulated jurisdictions with complex multi-currency payment needs.",
    website: "https://www.codere.com",
    pais_hq: "España",
  },
  {
    nombre: "Betway",
    uvp: "International sports betting brand with strong football and cricket coverage, competitive odds, and a polished mobile experience targeting mainstream bettors.",
    core: "Sports betting and online casino operator serving regulated markets across Europe, Africa, and the Americas with a focus on high-volume sports events.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Colombia","Perú","Chile"],
    killer_argument: "Betway's LATAM expansion is bottlenecked by payment localisation — Brazilian players expect instant PIX confirmation before placing their first bet; any latency or decline triggers abandonment. The brand has global recognition but loses conversion at checkout because its payment stack was built for European card rails. High decline rates on international cards issued in LATAM erode campaign ROI: marketing spends to acquire a player who then cannot deposit. KYC document checks for AML compliance add 24-72 hours of friction, further reducing first-deposit conversion.",
    strategic_hook: "If you tracked deposit conversion rates by country across LATAM, which market shows the biggest gap between registered accounts and first successful deposit — and have you isolated how much of that gap is payment method mismatch versus KYC friction?",
    tier: "Tier 1",
    tier_razon: "Globally recognised brand with significant LATAM marketing investment; scale and ambition make payment localisation failures expensive at volume.",
    website: "https://www.betway.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Jackpot City",
    uvp: "Veteran online casino brand with 25+ years of operation, offering 500+ slots, live dealer tables, and loyalty rewards under the Microgaming-powered Kahnawake licence.",
    core: "Online casino operator targeting recreational players with a broad game library, structured loyalty programme, and focus on long-term player retention.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Chile","Argentina"],
    killer_argument: "Jackpot City is a grey-market operator in most LATAM jurisdictions, meaning it cannot access domestic card processing directly. It relies on aggregators and offshore acquirers whose decline rates on LATAM-issued cards routinely exceed 40-60%. Brazilian players are accustomed to PIX as a zero-friction rail; when Jackpot City cannot offer it natively, players migrate to competitors. Recurring card charges for reload bonuses get flagged by local banks as suspicious, increasing involuntary churn among high-value players.",
    strategic_hook: "For your LATAM player base, what share of deposit attempts are going through offshore card processing versus local payment methods — and what does your decline rate look like compared to your European markets?",
    tier: "Tier 2",
    tier_razon: "Established brand with LATAM traffic but lacks local payment infrastructure; operates grey-market, limiting access to regulated local acquiring.",
    website: "https://www.jackpotcitycasino.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Spin Casino",
    uvp: "Mobile-first online casino with curated game selection, fast-claim bonuses, and a streamlined onboarding designed for players who want to get to the action quickly.",
    core: "Online casino operator under the Palace Group umbrella, focusing on slot-heavy game libraries and mobile UX to drive rapid player acquisition and retention.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Colombia","Chile"],
    killer_argument: "Spin Casino's mobile-first positioning falls apart at the payment screen in LATAM — a fast onboarding flow that ends in a declined card or a confusing international wire option destroys the brand promise. In Brazil, the absence of PIX means the player has already mentally exited by the time the payment fails. Withdrawal delays through offshore banking (5-10 business days to a LATAM bank account) generate the highest-volume support complaints and tank player LTV.",
    strategic_hook: "When a LATAM player completes registration and hits the deposit screen, what is your drop-off rate at that step — and do you know what payment method they were trying to use when they abandoned?",
    tier: "Tier 2",
    tier_razon: "Mid-size operator with growing LATAM presence; mobile-first brand damaged by friction-heavy payment experience on local devices.",
    website: "https://www.spincasino.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Royal Vegas",
    uvp: "Long-running online casino with a premium theme, large bonus structures, and a reputation for high payout limits appealing to higher-stakes recreational players.",
    core: "Online casino brand targeting mid-to-high value recreational players with large welcome bonuses, VIP programmes, and a broad game catalogue.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Argentina"],
    killer_argument: "Royal Vegas targets higher-stakes players, but in LATAM those players are most sensitive to withdrawal friction — if a VIP player requests a $2,000 withdrawal and it takes 10 days to arrive in their Argentine or Brazilian bank account, they churn permanently. The casino has no way to offer instant local bank transfers or Boleto payouts, so high-value players self-select away after their first significant win. Additionally, AML checks on large deposits from LATAM players trigger manual reviews that delay onboarding of the exact segment the brand wants to acquire.",
    strategic_hook: "Among your LATAM players who make a first withdrawal, what percentage return to deposit again — and do you have data on whether withdrawal speed correlates with 90-day retention in those markets?",
    tier: "Tier 2",
    tier_razon: "Premium-positioned brand with LATAM exposure; loses high-LTV players specifically due to slow, opaque withdrawal rails in the region.",
    website: "https://www.royalvegas.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Ruby Fortune",
    uvp: "Elegant-branded online casino with a loyalty point system, regular promotional calendar, and a curated selection of table games and slots for consistent recreational players.",
    core: "Online casino operator focused on player loyalty mechanics, frequent bonus cadence, and a polished brand identity to build habitual play patterns.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Chile"],
    killer_argument: "Ruby Fortune's business model depends on deposit frequency — the loyalty programme only works if players reload regularly. In LATAM, the friction of each deposit attempt (international card declines, lack of instant bank transfer options, mandatory re-verification) directly suppresses the repeat deposit rate that the entire retention model is built on. In Mexico, OXXO cash deposits require the player to physically visit a store and wait for confirmation; the 24-hour delay breaks the promotional urgency cycle. Each broken deposit journey is a missed bonus claim and a loyalty point the player never earns.",
    strategic_hook: "Your reload bonus redemption rate in LATAM — how does it compare to your European markets, and have you mapped where players are dropping off between receiving the bonus email and completing the deposit?",
    tier: "Tier 2",
    tier_razon: "Loyalty-driven model structurally dependent on deposit frequency; LATAM payment friction directly undermines the core retention mechanic.",
    website: "https://www.rubyfortune.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Gaming Club",
    uvp: "One of the original online casinos (est. 1994), offering heritage brand trust, classic game formats, and a no-frills experience for traditional casino players.",
    core: "Veteran online casino operation leveraging brand longevity and Microgaming content to serve traditional casino audiences who value stability over novelty.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México"],
    killer_argument: "Gaming Club's heritage is a liability in LATAM: players in Brazil and Mexico skew younger and mobile-native, expecting payment methods they already use daily (PIX, Mercado Pago). The casino's traditional card-based deposit flow feels archaic and produces high decline rates because LATAM-issued debit cards are frequently blocked for offshore gambling transactions by issuing banks. Player acquisition costs are rising but deposit conversion rates stay flat because the payment layer was never rebuilt for the region.",
    strategic_hook: "When a LATAM player contacts support about a failed deposit, what is the average resolution time — and do you track how many of those players make a successful deposit within 48 hours versus never returning?",
    tier: "Tier 2",
    tier_razon: "Legacy brand with limited LATAM-specific investment; heritage payment infrastructure is mismatched with LATAM player expectations and banking restrictions.",
    website: "https://www.gamingclub.com",
    pais_hq: "Malta",
  },
  {
    nombre: "Quickwin",
    uvp: "Fast-paced crypto and fiat casino offering instant withdrawals, anonymous play options, and a broad game library targeting crypto-savvy players who reject traditional banking friction.",
    core: "Crypto-forward online casino operator combining anonymous crypto play with fiat on-ramp options, targeting players in jurisdictions with restricted banking access to gambling.",
    vertical: "iGaming",
    mercados_latam: ["Brasil","México","Argentina","Colombia","Venezuela"],
    killer_argument: "Quickwin positions itself on speed and anonymity, but in LATAM both promises break down at the payment layer. Players in Venezuela and Argentina are drawn to crypto as a hedge against currency devaluation, but the on-ramp from ARS or VEF to USDT is slow, expensive, and technically complex for average players. In Brazil, regulators are tightening oversight of crypto-to-gambling flows, creating compliance risk. Meanwhile, players who want fiat deposits via PIX find the casino's fiat processing unreliable — the hybrid crypto-fiat stack creates confusion about which payment method will actually work, driving up abandonment and support volume simultaneously.",
    strategic_hook: "In your LATAM markets, what share of players attempt a fiat deposit after failing with crypto — and do you have a reliable local payment fallback in place for those players, or do you lose them at that moment?",
    tier: "Tier 2",
    tier_razon: "Emerging crypto casino with LATAM ambition; hybrid payment model creates friction at both the crypto on-ramp and fiat fallback stages in the region.",
    website: "https://quickwin.io",
    pais_hq: "Curazao",
  }
];

async function main() {
  console.log(`Insertando ${companies.length} casinos en empresas_v3...\n`);

  const { data, error } = await supabase
    .from('empresas_v3')
    .upsert(companies, { onConflict: 'nombre' })
    .select('nombre');

  if (error) {
    console.error('Error en upsert:');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  const inserted = data ? data.length : 0;
  console.log(`Completado. Total insertado: ${inserted}/${companies.length}\n`);

  if (data) {
    data.forEach((row, i) => console.log(`  ${i + 1}. ${row.nombre}`));
  }

  if (inserted < companies.length) {
    const processedNames = new Set((data || []).map(r => r.nombre));
    const missing = companies.map(c => c.nombre).filter(n => !processedNames.has(n));
    console.warn(`\nNo confirmados:`);
    missing.forEach(n => console.warn(`  - ${n}`));
  }
}

main();
