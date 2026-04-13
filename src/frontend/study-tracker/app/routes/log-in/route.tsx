import React, { useEffect, useState } from "react";
import { PlanDaySelectionPage } from "~/routes/log-in/PlanDaySelectionPage/PlanDaySelectionPage";
import { ShareProgressPage } from "./ShareProgressPage/ShareProgressPage";
import { useNavigate, useSearchParams } from "@remix-run/react";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { AppUsagesSelectionPage } from "~/routes/log-in/AppUsagesSelectionPage/AppUsagesSelectionPage";
import { ReceiveNotificationsSelectionPage } from "~/routes/log-in/ReceiveNotificationsSelectionPage/ReceiveNotificationsSelectionPage";

import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { Button } from "react-aria-components";

type Views =
    | "initial"
    | "authentication"
    | "appUsagesSelection"
    | "receiveNotificationsSelection"
    | "planDaySelection"
    | "shareProgressSelection"
    | "avatarSelection";

function CurrentView() {
    const [currentView, setCurrentView] = useState<Views>("initial");
    const navigate = useNavigate();
    const isLoggedIn = useIsLoggedIn();
    const [searchParams] = useSearchParams();

    // Vê se é um utilizador novo a entrar pela primeira vez
    const isSetup = searchParams.get("setup") === "true";

    useEffect(() => {
        if (isLoggedIn == undefined) {
            return; // Espera que a verificação de sessão termine
        }

        if (isLoggedIn) {
            if (currentView === "initial" || currentView === "authentication") {
                if (isSetup) {
                    // Utilizador novo: Inicia o processo de Onboarding!
                    setCurrentView("appUsagesSelection");
                } else {
                    // Utilizador antigo: Vai direto para o Dashboard
                    navigate(`/`);
                }
            }
        } else {
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#333' }}>Bem-vindo ao ACEdemic Tracker</h2>
                    <p style={{ marginBottom: '30px', color: '#666', fontSize: '1.1rem' }}>Para aceder, inicie sessão com as suas credenciais da faculdade.</p>
                    <Button 
                        onPress={() => window.location.href = "/api/auth/ulisboa/login?target=tracker"}
                        style={{
                            padding: '14px 28px',
                            backgroundColor: '#005baa',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        Log in ULisboa
                    </Button>
                </div>
            );
        case "appUsagesSelection":
            return (
                <AppUsagesSelectionPage
                    onProceed={() => setCurrentView("avatarSelection")} 
                />
            );
        case "receiveNotificationsSelection":
            return (
                <ReceiveNotificationsSelectionPage
                    onProceed={() => setCurrentView("planDaySelection")}
                />
            );
        case "planDaySelection":
            return (
                <PlanDaySelectionPage
                    onProceed={() => setCurrentView("shareProgressSelection")}
                />
            );
        case "shareProgressSelection":
            return (
                <ShareProgressPage
                    onShareSelected={() => setCurrentView("avatarSelection")}
                />
            );
        case "avatarSelection":
            return (
                <AvatarSelectionPage
                    onComplete={() => navigate(`/`)}
                />
            );
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