import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import styles from "./shareProgressPage.module.css";
import React from "react";
import classNames from "classnames";

function useShareProgressPage({ userId, onShareSelected }: { userId: number, onShareSelected: () => void }) {
    const setError = useSetGlobalError();

    async function selectShareProgressState(shareProgress: boolean) {
        await service
            .selectShareProgressState(userId, shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error));
    }

    return { selectShareProgressState };
}

export function ShareProgressPage(
    {
        userId,
        onShareSelected
    }: {
        userId: number;
        onShareSelected: () => void;
    }) {
    const { selectShareProgressState } = useShareProgressPage({ userId, onShareSelected });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1 className={styles.titleText}>
                    Do you want to share your progress?
                </h1>
                <br />
                <button
                    className={classNames(styles.roundButton, styles.shareProgressButton, styles.yes)}
                    onClick={() => {
                        selectShareProgressState(true);
                    }}
                >
                    Yes
                </button>
                <button
                    className={classNames(styles.roundButton, styles.shareProgressButton)}
                    onClick={() => {
                        selectShareProgressState(false);
                    }}
                >
                    No
                </button>
            </div>
        </div>
    );
}