import styles from "./loadingScreen.module.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer/Footer";
import { useTranslation } from "react-i18next";

const LOADING_OVERLAY_FULL_REMOVAL_DELAY = 1500;

export function LoadingOverlay({ loading }: { loading: boolean }) {
    const { t } = useTranslation(["common"]);
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        if (!loading) {
            const overlay = document.querySelector(`.${styles.loadingOverlay}`);
            const checkBox = document.querySelector(`.${styles.checkBox}`);
            if (overlay) {
                overlay.classList.add(styles.fadeOut);
                if (checkBox) checkBox.classList.add(styles.checked);
                setTimeout(() => setShowOverlay(false), LOADING_OVERLAY_FULL_REMOVAL_DELAY);
            }
        }
    }, [loading]);

    return (showOverlay &&
        <div className={styles.loadingOverlay}
             aria-hidden={loading ? undefined : true}
             aria-label={t("common:loading_screen")}
        >
            <div className="app">
                <LoadingScreen />
                <Footer />
            </div>
        </div>
    );
}

function Logo() {
    const { t } = useTranslation(["common"]);
    return (
        <div className={styles.logoContainer}>
            <div className={styles.acedemicTextContainer}>
                <h1 className={styles.aceText}>ACE</h1>
                <h1 className={styles.demicText}>DEMIC</h1>
            </div>
            <div className={styles.challengeAndTrophiesContainer}>
                <img src="icons/medal_icon.svg" alt={t("common:medal")} width={50} height={50}
                     style={{ marginTop: "-5px" }} />
                <h1 className={styles.challengeText}>CHALLENGE</h1>
                <img src="icons/trophy_icon2.svg" alt={t("common:trophy")} width={50} height={50} />
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className={styles.loadingScreen}>
            <Logo />
        </div>
    );
}