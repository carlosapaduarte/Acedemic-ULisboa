import { CutButton } from "~/components/Button/Button";
import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React from "react";
import styles from "./appBar.module.css";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer, NavBar } from "~/components/AppBar/HomeAppBar/HomeAppBar";

interface AppBarProps {
    variant?: "default" | "home" | "clean";
}

export function AppBar({ variant = "default" }: AppBarProps) {
    const navigate = useNavigate();

    switch (variant) {
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