import { CutButton } from "~/components/Button/Button";
import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React from "react";
import styles from "./appBar.module.css";

export function AppBar() {
    return (
        <div className={styles.appBar}>
            <CutButton className={`${styles.backButton}`}>
                {"<"}
            </CutButton>
            <div className={`${styles.homeButtonContainer}`}>
                <CutButton className={`${styles.homeButton}`}>
                    Home
                </CutButton>
            </div>
            <div className={styles.languageButtons}>
                <LanguageButton language={"pt-PT"} />
                <LanguageButton language={"en-GB"} />
            </div>
            {/*<GreetingsContainer />
            <NavBar />*/}
        </div>
    );
}