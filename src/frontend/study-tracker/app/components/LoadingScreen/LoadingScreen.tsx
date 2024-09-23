import styles from "./loadingScreen.module.css";

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