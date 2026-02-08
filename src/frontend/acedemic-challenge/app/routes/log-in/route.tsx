import React, { useEffect, useState } from "react";
import AuthenticationPage, {
    AuthAction,
} from "~/routes/log-in/AuthenticationPage/AuthenticationPage";
import ShareProgressPage from "~/routes/log-in/ShareProgressPage/ShareProgressPage";
import QuizPage from "~/routes/log-in/QuizPage/QuizPage";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate, useSearchParams } from "@remix-run/react";
// import { useUser } from "~/components/auth/UserProvider"; (Exemplo)

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

    // Ler o parâmetro ?setup=true
    const [searchParams] = useSearchParams();
    const isSetupRequested = searchParams.get("setup") === "true";

    const userId = "temp-id"; // CORREÇÃO TEMPORÁRIA para não dar erro de compilação no QuizPage

    useEffect(() => {
        if (isLoggedIn == undefined) {
            return;
        }

        // SE for pedido setup -> Iniciar Seleção de Avatar
        if (isLoggedIn && isSetupRequested && currentView == "initial") {
            setCurrentView("selectAvatar");
            return;
        }

        // Lógica Normal
        if (isLoggedIn && currentView == "initial") {
            navigate(`/`);
        }
    }, [isLoggedIn, isSetupRequested]);

    switch (currentView) {
        case "initial":
            return null;
        case "authentication":
            return (
                <AuthenticationPage
                    onAuthDone={(action: AuthAction) => {
                        if (action == AuthAction.CREATE_USER)
                            setCurrentView("chooseLevel");
                        else navigate(`/`);
                    }}
                />
            );
        case "shareProgress":
            return (
                <ShareProgressPage
                    onShareSelected={() => setCurrentView("chooseLevel")}
                />
            );
        case "chooseLevel":
            return (
                <SelectLevelPage
                    onLevelSelected={() => setCurrentView("selectAvatar")}
                    onStartQuizClick={() => setCurrentView("quiz")}
                />
            );
        case "quiz":
            return (
                <QuizPage
                    userId={userId!}
                    onLevelSelected={() => setCurrentView("selectAvatar")}
                />
            );
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
