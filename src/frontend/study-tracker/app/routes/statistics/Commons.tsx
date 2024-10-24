import styles from "./statistics.module.css";

export function Spacer() {
    return (
        <div className={styles.spacer}>

        </div>
    )
}

export function SeeFullHistory() {
    return (
        <button className={styles.seeFullHistoryButton}>
            <img src="/icons/history_icon.svg" alt="History Icon" className={styles.historyIcon}/>
            See full history
        </button>
    )
}