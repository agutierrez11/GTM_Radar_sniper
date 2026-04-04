import NervForm from "@/components/NervForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto px-0">
        <NervForm />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-zinc-100 text-center bg-white">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-8 font-medium">
            NERV GTM Intelligence OS v3.6 — McKinsey Grade Strategic Engine.
          </p>
      </footer>
    </main>
  );
}
