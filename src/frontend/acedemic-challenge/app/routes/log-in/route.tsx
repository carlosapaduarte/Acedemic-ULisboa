import React, { useState } from "react";
import UserInfoPage from "~/routes/log-in/UserInfoPage/UserInfoPage";
import ShareProgressPage from "~/routes/log-in/ShareProgressPage/ShareProgressPage";
import QuizPage from "~/routes/log-in/QuizPage/QuizPage";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { useNavigate } from "@remix-run/react";

type Views =
    | "userInfo"
    | "shareProgress"
    | "chooseLevel"
    | "quiz"
    | "selectAvatar";

/**
 * This React component:
 * - shows a dialogue to simulate authentication;
 * - asks user if can share progress;
 * - lists possible levels:
 *  - User might choose to start quiz
 * - redirects for calendar component.
 */
export default function LoginPage() {
    const [currentView, setCurrentView] = useState<Views>("userInfo");
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    switch (currentView) {
        case "userInfo":
            return (
                <UserInfoPage
                    onAuthDone={(userId) => {
                        setCurrentView("shareProgress");
                        setUserId(userId);
                    }}
                />
            );
        case "shareProgress":
            return (
                <ShareProgressPage
                    userId={userId!}
                    onShareSelected={() => setCurrentView("chooseLevel")}
                />
            );
        case "chooseLevel":
            return (
                <SelectLevelPage
                    userId={userId!}
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
                    userId={userId!}
                    onComplete={() => navigate(`/`)}
                />
            );
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}
