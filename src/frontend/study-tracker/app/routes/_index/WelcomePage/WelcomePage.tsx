import { useEffect } from "react";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useAppBar } from "~/components/AppBar/AppBarProvider";

export default function WelcomePage() {
    useAppBar("clean");
    
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn === false) {
            navigate("/log-in");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h2 style={{ color: "white" }}>A redirecionar para a autenticação...</h2>
        </div>
    );
}