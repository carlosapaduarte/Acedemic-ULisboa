import styles from "./loadingScreen.module.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { Footer } from "~/components/Footer/Footer";

export function LoadingOverlay({ loading }: { loading: boolean }) {
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        if (!loading) {
            const overlay = document.querySelector(`.${styles.loadingOverlay}`);
            console.log(styles.loadingOverlay);
            if (overlay) {
                overlay.classList.add(styles.fadeOut);
                setTimeout(() => setShowOverlay(false), 1000);
            }
        }
    }, [loading]);

    return (showOverlay &&
        <div className={styles.loadingOverlay}>
            <div className="app">
                <LoadingScreen />
                <Footer />
            </div>
        </div>
    );
}

export function LoadingScreen() {
    return (
        <div className={styles.loadingScreen}>
            <div className={styles.contentContainer}>
                <div className={styles.acedemicTextContainer}>
                    <h1 className={styles.aceText}>ACE</h1>
                    <h1 className={styles.demicText}>DEMIC</h1>
                </div>
                <div className={styles.trackerAndCheckboxContainer}>
                    <h1 className={styles.trackerText}>TRACKER</h1>
                    <div className={styles.checkBox}>
                    </div>
                </div>
            </div>
        </div>
    );
}