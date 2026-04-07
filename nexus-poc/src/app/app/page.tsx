import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import NervForm from "@/components/NervForm";

/**
 * Ruta protegida: /app
 * El middleware ya redirige al login si no hay sesión.
 * Esta verificación server-side es una segunda capa de seguridad.
 */
export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto px-0">
        <NervForm userEmail={user.email} />
      </div>

      <footer className="relative z-10 py-12 border-t border-zinc-100 text-center bg-white">
        <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-8 font-medium">
          NERV GTM Intelligence OS v3.6 — McKinsey Grade Strategic Engine.
        </p>
      </footer>
    </main>
  );
}
