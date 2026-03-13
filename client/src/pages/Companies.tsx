import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase, TABLE_LEADS } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Globe, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Crosshair,
  Flame,
  Gem,
  Network,
  ChevronRight,
  Lock,
  Users,
  Layers
} from 'lucide-react';

/**
 * NERV Sniper GTM: Tactical Command Center
 * 
 * Design Philosophy: Cyberpunk Military + Minimalism
 * - Precision over decoration
 * - Real-time dominance
 * - Hierarchy by urgency
 * - Scannable at glance
 * 
 * Color Scheme:
 * - Primary: Deep blue (#0A1428) + Neon cyan (#00D9FF)
 * - Alerts: Red for critical, Green for confirmed
 * - Background: Near-black with subtle grid effect
 */

const LATAM_COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'SR', name: 'Surinam' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
];

const FINTECH_SEGMENTS = [
  'pagos',
  'lending',
  'insurtech',
  'wallets',
  'remesas',
  'trading',
  'blockchain',
  'neobanks',
  'factoring',
  'otros',
];

// Mock data for companies with pain points and solutions
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'Nubank',
    country: 'BR',
    segment: 'neobanks',
    tier: 'diamond',
    status: 'target',
    description: 'Neobank líder en Brasil',
    painPoints: ['Deepfakes', 'Fraude sintético', 'Onboarding lento'],
    solutions: ['Biometría Liveness 3D', 'Monitoreo de transacciones'],
    killShot: 'Reduce fraude en 50% con detección de deepfakes en tiempo real',
    stakeholders: [
      { role: 'CTO', name: 'Tech Lead', motivation: 'Escalabilidad regional' },
      { role: 'Head of Growth', name: 'Champion', motivation: 'Reducir CAC 30%' },
      { role: 'Product Manager', name: 'Gatekeeper', motivation: 'Integración sin fricción' }
    ]
  },
  {
    id: '2',
    name: 'Nu México',
    country: 'MX',
    segment: 'neobanks',
    tier: 'gold',
    status: 'active',
    description: 'Expansión de Nubank en México',
    painPoints: ['Abandono 45%', 'Verificación lenta', 'Fricción onboarding'],
    solutions: ['Verificación sin documentos', 'Validación rápida'],
    killShot: 'Reduce abandono de 45% a 15% con verificación sin documentos',
    stakeholders: [
      { role: 'CTO', name: 'Tech Lead', motivation: 'Infraestructura escalable' },
      { role: 'Head of Growth', name: 'Champion', motivation: 'Velocidad de despliegue' }
    ]
  },
  {
    id: '3',
    name: 'Stori',
    country: 'MX',
    segment: 'lending',
    tier: 'gold',
    status: 'active',
    description: 'Fintech de crédito en México',
    painPoints: ['Fricción onboarding', 'Validación lenta', 'Tasa de rechazo alta'],
    solutions: ['Verificación sin documentos', 'Validación instantánea'],
    killShot: 'Acelera validación de 10 min a 2 seg, aumenta aprobaciones 40%',
    stakeholders: [
      { role: 'Head of Growth', name: 'Champion', motivation: 'Reducir CAC' },
      { role: 'Product Manager', name: 'Gatekeeper', motivation: 'UX mejorada' }
    ]
  },
  {
    id: '4',
    name: 'Koin',
    country: 'BR',
    segment: 'lending',
    tier: 'gold',
    status: 'target',
    description: 'Plataforma de crédito Brasil',
    painPoints: ['Fraude sintético en PIX', 'Deepfakes', 'Validación débil'],
    solutions: ['Biometría Liveness 3D', 'Monitoreo transaccional'],
    killShot: 'Elimina fraude sintético con liveness 3D, protege PIX',
    stakeholders: [
      { role: 'CTO', name: 'Tech Lead', motivation: 'Seguridad PIX' },
      { role: 'Head of Growth', name: 'Champion', motivation: 'Confianza del usuario' }
    ]
  },
  {
    id: '5',
    name: 'Clip',
    country: 'MX',
    segment: 'pagos',
    tier: 'diamond',
    status: 'target',
    description: 'Procesador de pagos México',
    painPoints: ['KYB lento', 'Onboarding B2B 3 días', 'Validación manual'],
    solutions: ['KYB automatizado', 'Onboarding en horas'],
    killShot: 'Reduce onboarding B2B de 3 días a 2 horas con KYB automatizado',
    stakeholders: [
      { role: 'CTO', name: 'Tech Lead', motivation: 'Automatización' },
      { role: 'Head of Growth', name: 'Champion', motivation: 'Escala rápida' },
      { role: 'Product Manager', name: 'Gatekeeper', motivation: 'Sin fricción' }
    ]
  },
  {
    id: '6',
    name: 'Konfio',
    country: 'MX',
    segment: 'lending',
    tier: 'gold',
    status: 'active',
    description: 'Fintech de crédito para PyMEs',
    painPoints: ['KYB complejo', 'Documentación manual', 'Ciclo largo'],
    solutions: ['KYB automatizado', 'Validación rápida'],
    killShot: 'Automatiza KYB, reduce ciclo de 2 semanas a 2 horas',
    stakeholders: [
      { role: 'Head of Growth', name: 'Champion', motivation: 'Escala operativa' }
    ]
  },
  {
    id: '7',
    name: 'Addi',
    country: 'CO',
    segment: 'lending',
    tier: 'silver',
    status: 'active',
    description: 'Fintech de crédito Colombia',
    painPoints: ['Validación lenta', 'Fraude', 'Tasa de rechazo'],
    solutions: ['Validación instantánea', 'Biometría'],
    killShot: 'Valida en 2 seg, reduce fraude 50%, aumenta aprobaciones',
    stakeholders: [
      { role: 'Product Manager', name: 'Gatekeeper', motivation: 'Mejor UX' }
    ]
  },
  {
    id: '8',
    name: 'Ualá',
    country: 'AR',
    segment: 'wallets',
    tier: 'gold',
    status: 'target',
    description: 'Billetera digital Argentina',
    painPoints: ['Onboarding lento', 'Fraude', 'Verificación débil'],
    solutions: ['Biometría Liveness', 'Verificación rápida'],
    killShot: 'Onboarding en 30 seg con biometría, reduce fraude 60%',
    stakeholders: [
      { role: 'CTO', name: 'Tech Lead', motivation: 'Seguridad' },
      { role: 'Head of Growth', name: 'Champion', motivation: 'Velocidad' }
    ]
  },
];

// Battle Card Component
function BattleCard({ company, onClose }: { company: typeof MOCK_COMPANIES[0]; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center gap-2">
            <Crosshair className="h-5 w-5" />
            Battle Card: {company.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Estrategia de ataque y kill-shot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Overview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">📍 TARGET PROFILE</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">País</p>
                <p className="text-white font-mono">{company.country}</p>
              </div>
              <div>
                <p className="text-slate-500">Segmento</p>
                <p className="text-white font-mono">{company.segment.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-500">Tier</p>
                <Badge className="bg-blue-600 text-white">{company.tier.toUpperCase()}</Badge>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <Badge className="bg-green-600 text-white">{company.status}</Badge>
              </div>
            </div>
          </div>

          {/* Pain Points */}
          <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              PAIN POINTS (Heridas)
            </h3>
            <div className="space-y-2">
              {company.painPoints.map((pain, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-1">▸</span>
                  <span className="text-slate-300">{pain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Kill-Shot */}
          <div className="bg-slate-900/50 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4" />
              THE KILL-SHOT (Ejecución)
            </h3>
            <p className="text-slate-200 font-mono text-sm leading-relaxed">
              {company.killShot}
            </p>
          </div>

          {/* Solutions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">🛠️ SOLUCIONES</h3>
            <div className="flex flex-wrap gap-2">
              {company.solutions.map((sol, idx) => (
                <Badge key={idx} variant="outline" className="border-cyan-500/50 text-cyan-300">
                  {sol}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stakeholders */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              STAKEHOLDERS (Matriz de Decisión)
            </h3>
            <div className="space-y-3">
              {Array.isArray(company.stakeholders) && company.stakeholders.map((sh: any, idx: number) => (
                <div key={idx} className="bg-slate-800/50 rounded p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-cyan-400">{sh.role}</span>
                    <Badge variant="outline" className="text-xs">{sh.name}</Badge>
                  </div>
                  <p className="text-slate-400">🎯 {sh.motivation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white">
              <Zap className="h-4 w-4 mr-2" />
              Enviar Battle Card
            </Button>
            <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400">
              <Lock className="h-4 w-4 mr-2" />
              Guardar en Vault
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pipeline Phase Visualizer
function PipelinePhase({ 
  phase, 
  icon: Icon, 
  companies, 
  color 
}: { 
  phase: string; 
  icon: React.ReactNode; 
  companies: typeof MOCK_COMPANIES; 
  color: string;
}) {
  return (
    <div className="flex-1">
      <div className={`text-center mb-4 pb-4 border-b-2 border-${color}-500/30`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {Icon}
          <h3 className="text-sm font-semibold text-slate-200">{phase}</h3>
        </div>
        <p className={`text-2xl font-bold text-${color}-400`}>{companies.length}</p>
      </div>
      <div className="space-y-2">
        {companies.map((company) => (
          <div 
            key={company.id} 
            className={`bg-slate-800/50 border border-${color}-500/20 rounded px-3 py-2 text-xs hover:bg-slate-700/50 transition-colors cursor-pointer group`}
          >
            <p className={`font-mono text-${color}-400} group-hover:text-${color}-300`}>
              {company.name}
            </p>
            <p className="text-slate-500 text-xs mt-1">{company.segment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Knowledge Graph Node
function GraphNode({ 
  company, 
  isSelected, 
  onClick 
}: { 
  company: typeof MOCK_COMPANIES[0]; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const tierColors = {
    diamond: 'from-blue-600 to-cyan-500',
    gold: 'from-yellow-600 to-orange-500',
    silver: 'from-gray-500 to-slate-400',
    emerging: 'from-green-600 to-emerald-500'
  };

  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-300 ${
        isSelected ? 'scale-125' : 'hover:scale-110'
      }`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${tierColors[company.tier as keyof typeof tierColors]}`} />
      
      {/* Node */}
      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${tierColors[company.tier as keyof typeof tierColors]} flex items-center justify-center border-2 ${isSelected ? 'border-cyan-300' : 'border-slate-700'} shadow-lg`}>
        <div className="text-center">
          <p className="text-xs font-bold text-white">{company.name.slice(0, 3).toUpperCase()}</p>
          <p className="text-xs text-slate-100">{company.tier[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {company.name} • {company.painPoints.length} pain points
      </div>
    </button>
  );
}

interface Company {
  id: string;
  name: string;
  country: string;
  segment: string;
  tier: string;
  status: string;
  description: string;
  painPoints: string[];
  solutions: string[];
  killShot: string;
  stakeholders: Array<{
    role: string;
    name: string;
    motivation: string;
  }>;
}

export default function Companies() {
  const [leads, setLeads] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('pipeline');

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      const { data, error } = await supabase.from(TABLE_LEADS).select('*').limit(1000);
      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        const parsedLeads: Company[] = (data || []).map((r: any) => {
          // Hybrid Logic: Check for direct columns or extract from description JSON
          let extra: any = {};
          try { 
            if (r.description && r.description.startsWith('{')) {
              extra = JSON.parse(r.description);
            }
          } catch(e) { /* ignore parse errors */ }

          return {
            id: r.id,
            name: r.name || 'Unknown',
            country: r.country || 'MX',
            segment: r.segment || 'saas',
            tier: r.tier || extra.tier || (extra.sniper_score > 90 ? 'diamond' : extra.sniper_score > 70 ? 'gold' : 'silver'),
            status: r.status || 'target',
            description: r.description || '',
            painPoints: r.pain_points || extra.pain_points || (extra.pain_points ? extra.pain_points : (r.description && !r.description.startsWith('{') ? [r.description] : ['Unprocessed'])),
            solutions: r.solutions || extra.solutions || ['Custom GTM Solution'],
            killShot: r.kill_shot || extra.kill_shot || extra.description || r.description,
            stakeholders: r.stakeholders || extra.stakeholders || [
              { role: 'Decision Maker', name: 'Strategic Lead', motivation: 'Revenue Growth' }
            ]
          };
        });
        setLeads(parsedLeads);
      }
      setLoading(false);
    };

    fetchLeads();
  }, []);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return leads.filter((company: Company) => {
      const matchesSearch = searchQuery.length === 0 || 
        company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || company.country === selectedCountry;
      const matchesSegment = selectedSegment === 'all' || company.segment === selectedSegment;
      const matchesTier = selectedTier === 'all' || company.tier === selectedTier;
      
      return matchesSearch && matchesCountry && matchesSegment && matchesTier;
    });
  }, [searchQuery, selectedCountry, selectedSegment, selectedTier]);

  // Separate by phase
  const hunting = useMemo(() => filteredCompanies.filter(c => c.tier === 'emerging' || c.tier === 'silver'), [filteredCompanies]);
  const refinery = useMemo(() => filteredCompanies.filter(c => c.tier === 'gold'), [filteredCompanies]);
  const liquidation = useMemo(() => filteredCompanies.filter(c => c.tier === 'diamond'), [filteredCompanies]);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setSelectedCountry('all');
    setSelectedSegment('all');
    setSelectedTier('all');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Tactical Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crosshair className="h-8 w-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-cyan-400">NERV Sniper GTM</h1>
          </div>
          <p className="text-slate-400 font-mono text-sm">Tactical Command Center • Intelligence Refinery • Real-Time Liquidation</p>
        </div>

        {/* Tactical Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800 border-l-2 border-l-cyan-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">TOTAL TARGETS</p>
                <p className="text-3xl font-bold text-cyan-400">{filteredCompanies.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800 border-l-2 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">HUNTING</p>
                <p className="text-3xl font-bold text-yellow-400">{hunting.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800 border-l-2 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">REFINERY</p>
                <p className="text-3xl font-bold text-orange-400">{refinery.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800 border-l-2 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">LIQUIDATION</p>
                <p className="text-3xl font-bold text-green-400">{liquidation.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-cyan-400">
              <Filter className="h-5 w-5" />
              Filtros Tácticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos los países</SelectItem>
                  {LATAM_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos los segmentos</SelectItem>
                  {FINTECH_SEGMENTS.map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment.charAt(0).toUpperCase() + segment.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos los tiers</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="emerging">Emerging</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleReset}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Layers className="h-4 w-4 mr-2" />
              Pipeline (Hunting → Refinery → Liquidation)
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Network className="h-4 w-4 mr-2" />
              Grafo de Correlaciones
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Tabla Táctica
            </TabsTrigger>
          </TabsList>

          {/* Pipeline View */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-cyan-400">The Refinery: 3 Fases de Liquidación</CardTitle>
                <CardDescription className="text-slate-400">
                  De Oro a Diamante: Hunting → Refinery → Liquidation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <PipelinePhase 
                    phase="HUNTING (Gold)" 
                    icon={<Target className="h-5 w-5 text-yellow-400" />}
                    companies={hunting}
                    color="yellow"
                  />
                  <div className="flex items-center">
                    <ChevronRight className="h-6 w-6 text-slate-600" />
                  </div>
                  <PipelinePhase 
                    phase="REFINERY (Processing)" 
                    icon={<Gem className="h-5 w-5 text-orange-400" />}
                    companies={refinery}
                    color="orange"
                  />
                  <div className="flex items-center">
                    <ChevronRight className="h-6 w-6 text-slate-600" />
                  </div>
                  <PipelinePhase 
                    phase="LIQUIDATION (Diamond)" 
                    icon={<Flame className="h-5 w-5 text-green-400" />}
                    companies={liquidation}
                    color="green"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Graph View */}
          <TabsContent value="graph" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Grafo de Correlaciones (Obsidian-style)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Visualización de relaciones entre empresas, pain points y soluciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-8 min-h-96 flex items-center justify-center">
                  <div className="flex flex-wrap gap-8 justify-center items-center">
                    {filteredCompanies.map((company) => (
                      <GraphNode
                        key={company.id}
                        company={company}
                        isSelected={selectedCompany?.id === company.id}
                        onClick={() => setSelectedCompany(company)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Connection Lines Info */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                    <p className="text-slate-500 mb-2">🔵 DIAMOND (High-Value)</p>
                    <p className="text-slate-300">Targets de máxima prioridad para liquidación inmediata</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                    <p className="text-slate-500 mb-2">🟡 GOLD (Medium-Value)</p>
                    <p className="text-slate-300">En fase de refinería, listos para procesamiento</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                    <p className="text-slate-500 mb-2">⚪ SILVER (Emerging)</p>
                    <p className="text-slate-300">En fase de hunting, requieren más inteligencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  {filteredCompanies.length} empresas encontradas
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Haz clic en una empresa para ver Battle Card y estrategia de ataque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">Empresa</th>
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">País</th>
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">Segmento</th>
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">Tier</th>
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">Pain Points</th>
                        <th className="text-left py-3 px-4 font-semibold text-cyan-400">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr 
                          key={company.id} 
                          className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-slate-100">{company.name}</p>
                              <p className="text-xs text-slate-500">{company.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-300">{company.country}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="border-slate-700 text-slate-300">
                              {company.segment}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`${
                              company.tier === 'diamond' ? 'bg-blue-600' :
                              company.tier === 'gold' ? 'bg-yellow-600' :
                              company.tier === 'silver' ? 'bg-gray-600' :
                              'bg-green-600'
                            } text-white`}>
                              {company.tier.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {company.painPoints.slice(0, 2).map((pain, idx) => (
                                <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs">
                                  {pain}
                                </Badge>
                              ))}
                              {company.painPoints.length > 2 && (
                                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                                  +{company.painPoints.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white"
                              onClick={() => setSelectedCompany(company)}
                            >
                              Battle Card
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Battle Card Modal */}
      {selectedCompany && (
        <BattleCard 
          company={selectedCompany} 
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
