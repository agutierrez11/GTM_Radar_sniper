"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CommentsSection() {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comentarios_poc")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      await supabase.from("comentarios_poc").insert([{ texto: newComment }]);
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error saving comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 Repositorio de Feedback PoC</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder="¿Qué te pareció Nexus? Deja tus comentarios para mejorar la demo..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "Enviando..." : "Publicar comentario"}
        </button>
      </form>

      <div style={styles.list}>
        {comments.map((c) => (
          <div key={c.id} style={styles.comment}>
            <p style={styles.text}>{c.texto}</p>
            <span style={styles.date}>{new Date(c.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: 40,
    padding: 24,
    background: "#f8fafc",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: "#0f172a",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    marginBottom: 24,
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    minHeight: 80,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  btn: {
    padding: "10px 20px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    alignSelf: "flex-end" as const,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  comment: {
    padding: 12,
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  text: {
    fontSize: 14,
    color: "#334155",
    margin: "0 0 6px 0",
    lineHeight: 1.5,
  },
  date: {
    fontSize: 11,
    color: "#94a3b8",
  },
};
