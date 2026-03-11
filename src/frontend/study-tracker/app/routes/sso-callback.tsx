import { useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import { useAppBar } from "~/components/AppBar/AppBarProvider";

export default function SSOCallback() {
  useAppBar("clean");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const target = searchParams.get("target");
    const username = searchParams.get("username");
    const isNewUser = searchParams.get("new") === "true";

    if (token) {
      console.log("🎟️ Token recebido! A gravar chaves mestras...");

      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("jwt", token);

      if (username) {
        localStorage.setItem(
          "user",
          JSON.stringify({ username, token, access_token: token }),
        );
      }

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

      setTimeout(() => {
        const setupParam = isNewUser ? "?setup=true" : "";
        window.location.href = `/tracker/log-in${setupParam}`;
      }, 100);
    } else {
      console.error("❌ Erro: Nenhum token encontrado no URL.");
      window.location.href = "/tracker/log-in";
    }
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
        style={{
          borderBottomColor: "transparent",
          borderRadius: "50%",
          border: "4px solid #2563eb",
          borderTopColor: "transparent",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <h2>A iniciar sessão de forma segura... 🔐</h2>
      <p style={{ color: "gray", marginTop: "10px" }}>
        Estamos a preparar o teu ambiente de estudo.
      </p>
    </div>
  );
}
