"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completando acceso…");

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        finish();
        router.replace("/app");
      }
    });

    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          finish();
          return;
        }
        router.replace("/app");
        finish();
        return;
      }
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();
      if (sessErr) {
        setMessage(sessErr.message);
        finish();
        return;
      }
      if (session) {
        router.replace("/app");
        finish();
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      const { data: { session: s2 } } = await supabase.auth.getSession();
      if (s2) {
        router.replace("/app");
        finish();
        return;
      }
      setMessage("Enlace inválido o expirado.");
      setTimeout(() => router.replace("/login?error=auth_failed"), 1500);
      finish();
    };
    run();
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#94a3b8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {message}
    </div>
  );
}
