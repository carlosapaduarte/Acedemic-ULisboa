import { CutButton } from "~/components/Button/Button";
import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React, { createContext, useContext, useState } from "react";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import styles from "./appBar.module.css";

import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer, NavBar } from "~/components/AppBar/HomeAppBar/HomeAppBar";

type AppBarVariant = "default" | "home" | "clean";

type AppBarContextType = {
    appBarVariant: AppBarVariant;
    setAppBarVariant: (variant: AppBarVariant) => void;
};

export const AppBarContext = createContext<AppBarContextType>({
    appBarVariant: "default",
    setAppBarVariant: (variant: AppBarVariant) => {
    }
});

export function AppBarProvider({ children }: { children: React.ReactNode }) {
    const [appBarVariant, setAppBarVariant] = useState<AppBarVariant>("default");

    return <AppBarContext.Provider value={{ appBarVariant, setAppBarVariant }}>
        {children}
    </AppBarContext.Provider>;
}

export function AppBar() {
    const { appBarVariant } = useContext(AppBarContext);

    const navigate = useNavigate();

    return (
        <div className={appBarVariant === "home" ? homeAppBarStyles.appBar : styles.appBar}>
            <CutButton
                className={appBarVariant === "home" ? homeAppBarStyles.backButton : styles.backButton}
                onClick={() => navigate(-1)}
            >
                {"<"}
            </CutButton>
            {appBarVariant !== "home" && (
                <div className={styles.homeButtonContainer} onClick={() => navigate("/")}>
                    <CutButton className={styles.homeButton}>
                        Home
                    </CutButton>
                </div>
            )}
            <div key="settingsButtons"
                 className={appBarVariant === "home" ? homeAppBarStyles.settingsButtons : styles.settingsButtons}>
                <SettingsButton />
                <LanguageButton language={"pt-PT"} />
                <LanguageButton language={"en-GB"} />
            </div>
            {appBarVariant === "home" && (
                <>
                    <GreetingsContainer />
                    <NavBar />
                </>
            )}
        </div>
    );
}