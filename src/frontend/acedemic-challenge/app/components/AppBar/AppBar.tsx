import { CutButton } from "~/components/Button/Button";
import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React from "react";
import styles from "./appBar.module.css";
import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";

export function AppBar() {
    const navigate = useNavigate();

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
}