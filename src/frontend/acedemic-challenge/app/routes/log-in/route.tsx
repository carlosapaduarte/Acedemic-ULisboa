import React, { useEffect, useState } from "react";
import AuthenticationPage, { AuthAction } from "~/routes/log-in/AuthenticationPage/AuthenticationPage";
import ShareProgressPage from "~/routes/log-in/ShareProgressPage/ShareProgressPage";
import QuizPage from "~/routes/log-in/QuizPage/QuizPage";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { useNavigate } from "@remix-run/react";
import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useIsLoggedIn } from "~/components/auth/Authn";

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

    const [userId, setUserId] = useState<number | undefined>(undefined);

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
                <AuthenticationPage
                    onAuthDone={(action: AuthAction) => {
                        if (action == AuthAction.CREATE_USER)
                            setCurrentView("chooseLevel");
                        else
                            navigate(`/`);
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
            return (
                <AvatarSelectionPage
                    onComplete={() => navigate(`/`)}
                />
            );
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}

/**
 * This React component:
 * - shows a dialogue to simulate authentication;
 * - asks user if can share progress;
 * - lists possible levels:
 *  - User might choose to start quiz
 * - redirects for calendar component.
 */
export default function LoginPage() {
    useAppBar("clean");

    return <div className={classNames(styles.loginPage)}>
        <CurrentView />
    </div>;
}
