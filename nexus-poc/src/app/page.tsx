import NexusForm from "@/components/NexusForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-20 pb-40 px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            PoC Live: Operación Nexo Fintech
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Architect</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Orquestador de Inteligencia GTM especializado en el ecosistema Fintech Latam. 
            Consultoría técnica masiva procesada con RaiSE Engine.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-1">
          <div className="bg-white rounded-[22px] overflow-hidden">
            <NexusForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-zinc-900 text-center">
        <p className="text-sm text-zinc-500">
          © 2026 Nexus Architect | Powered by RaiSE Engine & Supabase Intelligence.
        </p>
      </footer>
    </main>
  );
}
