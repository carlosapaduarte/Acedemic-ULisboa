import styles from "./loadingScreen.module.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer/Footer";

const LOADING_OVERLAY_FULL_REMOVAL_DELAY = 1500;

export function LoadingOverlay({ loading }: { loading: boolean }) {
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
             aria-label="Loading Screen - Acedemic Challenge"
        >
            <div className="app">
                <LoadingScreen />
                <Footer />
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className={styles.loadingScreen}>
            <div className={styles.contentContainer}>
                <div className={styles.acedemicTextContainer}>
                    <h1 className={styles.aceText}>ACE</h1>
                    <h1 className={styles.demicText}>DEMIC</h1>
                </div>
                <div className={styles.challengeAndCheckboxContainer}>
                    <h1 className={styles.challengeText}>CHALLENGE</h1>
                </div>
            </div>
        </div>
    );
}