export const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  // Identity & Compliance
  'kyc': 'Identity & Compliance',
  'kyb': 'Identity & Compliance',
  'identidad': 'Identity & Compliance',
  'verificacion': 'Identity & Compliance',
  'biometria': 'Identity & Compliance',
  'aml': 'Identity & Compliance',
  // Payments
  'pagos': 'Payments & Remittances',
  'payments': 'Payments & Remittances',
  'remesas': 'Payments & Remittances',
  'transferencias': 'Payments & Remittances',
  'adquirencia': 'Payments & Remittances',
  // Lending
  'credito': 'Lending',
  'lending': 'Lending',
  'prestamos': 'Lending',
  'bnpl': 'Lending',
  // Crypto
  'crypto': 'Crypto & Blockchain',
  'blockchain': 'Crypto & Blockchain',
  'web3': 'Crypto & Blockchain',
  'defi': 'Crypto & Blockchain',
  // Insurtech
  'seguros': 'Insurtech',
  'insurance': 'Insurtech',
  // Wealth
  'inversiones': 'Wealth Management',
  'wealth': 'Wealth Management',
  'trading': 'Wealth Management',
  // Digital Banking
  'banking': 'Digital Banking',
  'neobank': 'Digital Banking',
  'cuenta': 'Digital Banking',
  // Open Finance
  'open finance': 'Open Finance',
  'apis bancarias': 'Open Finance',
  'banking as a service': 'Open Finance',
  'bas': 'Open Finance',
};

export function detectProductCategory(producto: string): string {
  const lower = producto.toLowerCase();
  for (const [keyword, category] of Object.entries(PRODUCT_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'Tech Infrastructure'; // fallback
}
