import React, { useEffect, useState } from "react";
import ShareProgressPage from "~/routes/log-in/ShareProgressPage/ShareProgressPage";
import QuizPage from "~/routes/log-in/QuizPage/QuizPage";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { useNavigate, useSearchParams } from "@remix-run/react";
import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { Button } from "react-aria-components";

type Views =
    | "initial"
    | "authentication"
    | "shareProgress"
    | "chooseLevel"
    | "quiz"
    | "selectAvatar";

function CurrentView() {
    const [currentView, setCurrentView] = useState<Views>("initial");
    const navigate = useNavigate();
    const isLoggedIn = useIsLoggedIn();
    const [searchParams] = useSearchParams();
    
    // Deteta se o utilizador é novo e precisa de configurar a conta
    const isSetup = searchParams.get("setup") === "true";
    const [userId, setUserId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (isLoggedIn === undefined) return; // Ainda a carregar

        if (isLoggedIn) {
            // Se já tem sessão, mas está preso no ecrã de login/inicial
            if (currentView === "initial" || currentView === "authentication") {
                if (isSetup) {
                    // É um utilizador novo! Vai buscar o ID dele para o Quiz funcionar.
                    const token = localStorage.getItem("token");
                    if (token) {
                        fetch('/api/commons/users/me', {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        .then(res => res.json())
                        .then(data => setUserId(data.id))
                        .catch(console.error);
                    }
                    // Manda-o escolher o nível
                    setCurrentView("chooseLevel");
                } else {
                    // Utilizador antigo, vai direto para a Home Page
                    navigate(`/`);
                }
            }
        } else {
            // Se não tem sessão iniciada, mostra o botão da ULisboa
            if (currentView === "initial") {
                setCurrentView("authentication");
            }
        }
    }, [isLoggedIn, currentView, isSetup, navigate]);

    switch (currentView) {
        case "initial":
            return null;
        case "authentication":
            return (
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.trophyIcon}>🏆</div>
                        <h2 className={styles.title}>ACEdemic Challenge</h2>
                        <p className={styles.subtitle}>
                            Liberta o teu potencial. Entra na arena para desbloqueares conquistas e elevares o teu percurso académico.
                        </p>
                        
                        {/* 💡 O Botão Atualizado para Entrar E Registar */}
                        <Button
                            className={styles.actionButton}
                            onPress={() => window.location.href = "/api/auth/ulisboa/login?target=challenge"}
                        >
                            Entrar / Registar com Fénix
                        </Button>
                        
                        <p className={styles.helperText}>
                            A tua conta ULisboa é tudo o que precisas. Se for o teu primeiro acesso, a conta será criada automaticamente!
                        </p>
                    </div>
                </div>
            );
        case "shareProgress":
            return <ShareProgressPage onShareSelected={() => setCurrentView("chooseLevel")} />;
        case "chooseLevel":
            return <SelectLevelPage onLevelSelected={() => setCurrentView("selectAvatar")} onStartQuizClick={() => setCurrentView("quiz")} />;
        case "quiz":
            return <QuizPage userId={userId!} onLevelSelected={() => setCurrentView("selectAvatar")} />;
        case "selectAvatar":
            return <AvatarSelectionPage onComplete={() => navigate(`/`)} />;
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}

export default function LoginPage() {
    useAppBar("clean");

    return (
        <div className={classNames(styles.loginPage)}>
            <CurrentView />
        </div>
    );
}