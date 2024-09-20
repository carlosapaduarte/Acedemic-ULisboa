import React, { useState } from "react";
import { PlanDaySelectionPage } from "~/routes/log-in/PlanDaySelectionPage/PlanDaySelectionPage";
import { ShareProgressPage } from "./ShareProgressPage/ShareProgressPage";
import { useNavigate } from "@remix-run/react";
import UserInfoPage from "./UserInfoPage/UserInfoPage";
import AvatarSelectionPage from "~/routes/log-in/AvatarSelectionPage/AvatarSelectionPage";
import { AppUsagesSelectionPage } from "~/routes/log-in/AppUsagesSelectionPage/AppUsagesSelectionPage";
import {
    ReceiveNotificationsSelectionPage
} from "~/routes/log-in/ReceiveNotificationsSelectionPage/ReceiveNotificationsSelectionPage";

import styles from "./login.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBar";

type Views =
    | "userInfo"
    | "appUsagesSelection"
    | "receiveNotificationsSelection"
    | "planDaySelection"
    | "shareProgressSelection"
    | "avatarSelection";

function CurrentView() {
    const [currentView, setCurrentView] = useState<Views>("userInfo");
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    switch (currentView) {
        case "userInfo":
            return (
                <UserInfoPage
                    onAuthDone={(userId) => {
                        setCurrentView("appUsagesSelection");
                        setUserId(userId);
                    }}
                />
            );
        case "appUsagesSelection":
            return (
                <AppUsagesSelectionPage
                    onProceed={() => setCurrentView("receiveNotificationsSelection")}
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
                    userId={userId!}
                    onShareSelected={() => setCurrentView("avatarSelection")}
                />
            );
        case "avatarSelection":
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

export default function LoginPage() {
    useAppBar("clean");

    return <div className={classNames(styles.loginPage)}>
        <CurrentView />
    </div>;
}