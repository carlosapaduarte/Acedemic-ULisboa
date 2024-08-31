import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import AppUseGoals from "~/components/login/AppUseGoal";
import { Avatar } from "~/components/login/Avatar";
import { PlanDaySelection } from "~/components/login/PlanDaySelection";
import { ReceiveNotificationsPreferenceSelection } from "~/components/login/ReceiveNotificationsPrefSelection";
import { ShareProgress } from "~/components/login/ShareProgress";
import { UserInfo } from "~/components/login/UserInfo";

type Views =
    | "userInfo"
    | "appUseGoalSelection"
    | "receiveNotificationsPreferenceSelection"
    | "planDaySelection"
    | "shareProgressSelection"
    | "selectAvatar"
    | "redirect";

function LogIn() {
    const [currentView, setCurrentView] = useState<Views>("userInfo");
    const [userId, setUserId] = useState<number | undefined>(undefined);

    switch (currentView) {
        case "userInfo":
            return (
                <UserInfo
                    onAuthDone={(userId) => {
                        setCurrentView("appUseGoalSelection");
                        setUserId(userId);
                    }}
                />
            );
        case "appUseGoalSelection":
            return (
                <AppUseGoals
                    onProceed={() => setCurrentView("receiveNotificationsPreferenceSelection")}
                />
            );
        case "receiveNotificationsPreferenceSelection":
            return (
                <ReceiveNotificationsPreferenceSelection
                    onProceed={() => setCurrentView("planDaySelection")}
                />
            )
        case "planDaySelection":
            return (
                <PlanDaySelection
                    onProceed={() => setCurrentView("shareProgressSelection")}
                />
            )
        case "shareProgressSelection":
            return (
                <ShareProgress
                    userId={userId!}
                    onShareSelected={() => setCurrentView("selectAvatar")}
                />
            );
        case "selectAvatar":
            return (
                <Avatar
                    userId={userId!}
                    onComplete={() => setCurrentView("redirect")}
                />
            );
        case "redirect":
            return <Navigate to={`/dashboard/${userId}`} replace={true} />;
        default:
            return <h1>Should not have arrived here!</h1>;
    }
}

export default LogIn;
