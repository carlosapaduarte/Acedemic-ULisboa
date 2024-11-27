import React from "react";

import styles from "./progressBar.module.css";

export function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
                <div className={styles.progressBarFillContainer}>
                    <div className={styles.progressBarFill}
                         style={
                             {
                                 "--progressBarFillWidth": `${progress}%`
                             } as React.CSSProperties}>
                    </div>
                </div>
                <img src="icons/trophy_icon.svg"
                     alt="Trophy Icon"
                     className={styles.progressBarTrophyIcon} />
            </div>
        </div>
    );
}