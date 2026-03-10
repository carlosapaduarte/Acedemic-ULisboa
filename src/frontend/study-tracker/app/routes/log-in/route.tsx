import React, { useEffect, useState } from "react";
import { PlanDaySelectionPage } from "~/routes/log-in/PlanDaySelectionPage/PlanDaySelectionPage";
import { ShareProgressPage } from "./ShareProgressPage/ShareProgressPage";
import { useNavigate } from "@remix-run/react";
import AuthenticationPage, { AuthAction } from "~/routes/log-in/AuthenticationPage/AuthenticationPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { AppUsagesSelectionPage } from "~/routes/log-in/AppUsagesSelectionPage/AppUsagesSelectionPage";
import {
    ReceiveNotificationsSelectionPage
} from "~/routes/log-in/ReceiveNotificationsSelectionPage/ReceiveNotificationsSelectionPage";

import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";

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

    useEffect(() => {
        if (isLoggedIn == undefined) {
            return;
        }

        if (isLoggedIn && currentView == "initial") {
            navigate(`/`);
        }

        if (!isLoggedIn && currentView == "initial") {
            setCurrentView("authentication");
        }
    }, [isLoggedIn]);

    switch (currentView) {
        case "initial":
            return null;
        case "authentication":
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                    <h2>Bem-vindo ao Acedemic Tracker</h2>
                    <p style={{ marginBottom: '30px' }}>Para aceder, inicie sessão com as suas credenciais da faculdade.</p>
                    <button 
                        onClick={() => window.location.href = "https://acedemic.studentlife.ulisboa.pt/api/auth/ulisboa/login?target=tracker"}
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
                        Entrar com a Conta ULisboa
                    </button>
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

    return <div className={classNames(styles.loginPage)}>
        <CurrentView />
    </div>;
}