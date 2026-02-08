import { useEffect } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const target = searchParams.get("target");
    const username = searchParams.get("username");
    const isNewUser = searchParams.get("new") === "true";

    if (token) {
      console.log("🎟️ Token recebido! A gravar chaves mestras...");

      // 1. Gravar com TODOS os nomes comuns
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("jwt", token);

      if (username) {
        localStorage.setItem(
          "user",
          JSON.stringify({ username, token, access_token: token }),
        );
      }

      // 2. Gravar Cookie
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

      console.log(
        `🚀 Redirecionando para: ${target || "tracker"} (Novo: ${isNewUser})`,
      );

      // 3. Redirecionar com delay
      setTimeout(() => {
        // Se for novo, adicionamos ?setup=true ao URL de destino
        const setupParam = isNewUser ? "?setup=true" : "";

        if (target === "challenge") {
          if (isNewUser) {
            // Challenge Novo -> Login com setup
            window.location.href = `/challenge/log-in?setup=true`;
          } else {
            // Challenge Antigo -> Dashboard
            window.location.href = `/challenge`;
          }
        } else if (target === "tracker") {
          // Tracker (Novo ou Antigo vai para login e o route.tsx decide)
          window.location.href = `/tracker/log-in${setupParam}`;
        } else {
          window.location.href = `/tracker/log-in${setupParam}`;
        }
      }, 100);
    } else {
      console.error("❌ Erro: Nenhum token encontrado no URL.");
      // Fallback seguro
      window.location.href = "/tracker/log-in";
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">
        A iniciar sessão...
      </h2>
      <p className="text-gray-500 text-sm mt-2">
        Estamos a preparar o teu ambiente de estudo.
      </p>
    </div>
  );
}
