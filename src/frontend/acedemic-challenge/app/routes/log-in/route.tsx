import React, { useState } from "react";
import UserInfo from "~/routes/log-in/UserInfo";
import ShareProgress from "~/routes/log-in/ShareProgress";
import Quiz from "~/routes/log-in/Quiz";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage";
import { useNavigate } from "@remix-run/react";

type Views =
    | "userInfo"
    | "shareProgress"
    | "chooseLevel"
    | "quiz"
    | "selectAvatar"
    | "redirect";

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

    if (currentView == "redirect") {
        navigate(`/dashboard/${userId}`);
    }

    switch (currentView) {
        case "userInfo":
            return (
                <UserInfo
                    onAuthDone={(userId) => {
                        setCurrentView("shareProgress");
                        setUserId(userId);
                    }}
                />
            );
        case "shareProgress":
            return (
                <ShareProgress
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
                <Quiz
                    userId={userId!}
                    onLevelSelected={() => setCurrentView("selectAvatar")}
                />
            );
        case "selectAvatar":
            return (
                <AvatarSelectionPage
                    userId={userId!}
                    onComplete={() => setCurrentView("redirect")}
                />
            );
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}
