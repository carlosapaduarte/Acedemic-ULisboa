import { Link } from "@remix-run/react";

export default function TrackerReservado() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "var(--text-color-1)",
        fontFamily: "var(--font-family1), sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚧</div>

      <h1
        style={{
          fontFamily: "var(--font-family2), sans-serif",
          fontSize: "2.5rem",
          fontWeight: "900",
          marginBottom: "1rem",
          color: "var(--color-2)",
        }}
      >
        Em Desenvolvimento
      </h1>

      <p
        style={{
          fontSize: "1.25rem",
          maxWidth: "600px",
          lineHeight: "1.6",
          marginBottom: "1.5rem",
        }}
      >
        Olá! Esta plataforma encontra-se atualmente em fase de construção.
      </p>

      <p
        style={{
          fontSize: "1.1rem",
          maxWidth: "600px",
          lineHeight: "1.6",
          marginBottom: "2.5rem",
          color: "var(--color-3)",
        }}
      >
        Brevemente estará disponível. Prepara-te para as novidades!
      </p>

      <div
        style={{
          border: "2px dashed var(--color-3)",
          padding: "1rem",
          borderRadius: "0.75rem",
          maxWidth: "500px",
          marginBottom: "2.5rem",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-3)" }}>
          💡 <b>Dica:</b> Certifica-te de que iniciaste sessão com o teu Email
          Institucional
        </p>
      </div>

      <Link
        to="/log-in"
        style={{
          padding: "0.8rem 2rem",
          backgroundColor: "var(--color-4)",
          color: "var(--text-color-2)",
          textDecoration: "none",
          borderRadius: "9999px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Voltar ao Login
      </Link>
    </div>
  );
}
