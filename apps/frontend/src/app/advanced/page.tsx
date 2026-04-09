import NervFormAdvanced from "@/components/NervFormAdvanced";

export default function AdvancedPage() {
  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-10 pb-40 px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-1">
          <div className="bg-white rounded-[22px] overflow-hidden">
            <NervFormAdvanced />
          </div>
        </div>
      </div>
    </main>
  );
}
