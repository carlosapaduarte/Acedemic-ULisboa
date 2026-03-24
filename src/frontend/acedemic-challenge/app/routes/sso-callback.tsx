import { useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
// Importa o teu AppBar correto se existir no Challenge, ou remove esta linha
// import { useAppBar } from "~/components/AppBar/AppBarProvider"; 

export default function SSOCallback() {
  // useAppBar("clean");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const target = searchParams.get("target");
    const username = searchParams.get("username");
    const isNewUser = searchParams.get("new") === "true";

    if (token) {
      console.log("🎟️ Token recebido! A gravar chaves do Challenge...");

      // 1. Gravar com nomes ISOLADOS para o Challenge
      localStorage.setItem("challenge_token", token);
      localStorage.setItem("challenge_jwt", token);

      if (username) {
        localStorage.setItem(
          "challenge_user",
          JSON.stringify({ username, token })
        );
      }

      // 2. A MAGIA DO ISOLAMENTO: Cookies restritas à pasta /challenge/
      document.cookie = `token=${token}; path=/challenge/; max-age=86400; SameSite=Lax`;
      document.cookie = `access_token=${token}; path=/challenge/; max-age=86400; SameSite=Lax`;

      // 3. Redirecionar
      setTimeout(() => {
        const setupParam = isNewUser ? "?setup=true" : "";
        window.location.href = `/challenge/log-in${setupParam}`;
      }, 100);
      
    } else {
      window.location.href = "/challenge/log-in";
    }
  }, [searchParams]);

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" style={{ borderBottomColor: 'transparent', borderRadius: '50%', border: '4px solid #2563eb', borderTopColor: 'transparent', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      <h2>A iniciar sessão no ACEdemic Challenge... 🔐</h2>
    </div>
  );
}