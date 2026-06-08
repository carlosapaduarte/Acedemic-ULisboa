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
import { useTranslation } from "react-i18next";

type Views =
    | "initial"
    | "authentication"
    | "appUsagesSelection"
    | "receiveNotificationsSelection"
    | "planDaySelection"
    | "shareProgressSelection"
    | "avatarSelection";

function CurrentView() {
    const { t } = useTranslation(["login"]);
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
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.targetIcon}>🎯</div>
                        
                        <h2 className={styles.title}>{t("login:tracker_title", "Study Tracker")}</h2>
                        <p className={styles.subtitle}>
                            {t("login:tracker_subtitle", "Organiza o teu estudo, acompanha o teu progresso e atinge os teus objetivos.")}
                        </p>
                        
                        {/* 💡 O Botão Atualizado */}
                        <Button 
                            className={styles.actionButton}
                            onPress={() => window.location.href = "/api/auth/ulisboa/login?target=tracker"}
                        >
                            {t("login:auth_button", "Autenticação ULisboa")}
                        </Button>
                        
                        <p className={styles.helperText}>
                            {t("login:auth_helper", "A tua conta ULisboa é tudo o que precisas. Se for o teu primeiro acesso, a conta será criada automaticamente!")}
                        </p>
                    </div>
                </div>
            );
        case "appUsagesSelection":
            return <AppUsagesSelectionPage onProceed={() => setCurrentView("avatarSelection")} />;
        case "receiveNotificationsSelection":
            return <ReceiveNotificationsSelectionPage onProceed={() => setCurrentView("planDaySelection")} />;
        case "planDaySelection":
            return <PlanDaySelectionPage onProceed={() => setCurrentView("shareProgressSelection")} />;
        case "shareProgressSelection":
            return <ShareProgressPage onShareSelected={() => setCurrentView("avatarSelection")} />;
        case "avatarSelection":
            return <AvatarSelectionPage onComplete={() => navigate(`/`)} />;
        default:
            return <h1>{t("login:error_state", "Should not have arrived here!")}</h1>;
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