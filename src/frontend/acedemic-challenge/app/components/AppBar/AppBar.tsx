import { CutButton } from "~/components/Button/Button";
import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React, { createContext, useContext, useState } from "react";
import styles from "./appBar.module.css";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
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

    switch (appBarVariant) {
        case "default":
            return (
                <div className={styles.appBar}>
                    <CutButton className={`${styles.backButton}`} onClick={() => navigate(-1)}>
                        {"<"}
                    </CutButton>
                    <div className={`${styles.homeButtonContainer}`} onClick={() => navigate("/")}>
                        <CutButton className={`${styles.homeButton}`}>
                            Home
                        </CutButton>
                    </div>
                    <div className={styles.settingsButtons}>
                        <SettingsButton />
                        <LanguageButton language={"pt-PT"} />
                        <LanguageButton language={"en-GB"} />
                    </div>
                    {/*<GreetingsContainer />
                    <NavBar />*/}
                </div>
            );
        case "home":
            return (
                <div className={homeAppBarStyles.homeAppBar}>
                    <CutButton className={`${homeAppBarStyles.backButton}`} onClick={() => navigate(-1)}>
                        {"<"}
                    </CutButton>
                    <div className={homeAppBarStyles.settingsButtons}>
                        <SettingsButton />
                        <LanguageButton language={"pt-PT"} />
                        <LanguageButton language={"en-GB"} />
                    </div>
                    <GreetingsContainer />
                    <NavBar />
                </div>
            );
    }
}