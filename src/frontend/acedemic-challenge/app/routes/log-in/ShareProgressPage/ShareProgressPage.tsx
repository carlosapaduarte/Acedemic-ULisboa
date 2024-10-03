import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React from "react";
import styles from "./shareProgressPage.module.css";
import { Button } from "~/components/Button/Button";

export default function ShareProgressPage(
    {
        onShareSelected
    }: {
        onShareSelected: () => void;
    }) {
    const { selectShareProgressState } = useShareProgressPage({ onShareSelected });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1 className={styles.titleText}>
                    Do you want to share your progress?
                </h1>
                <br />
                <Button variant={"round"}
                        className={`${styles.shareProgressButton} ${styles.yes}`}
                        onClick={() => {
                            selectShareProgressState(true);
                        }}
                >
                    Yes
                </Button>
                <Button variant={"round"}
                        className={`${styles.shareProgressButton}`}
                        onClick={() => {
                            selectShareProgressState(false);
                        }}
                >
                    No
                </Button>
            </div>
        </div>
    );
}

function useShareProgressPage({ onShareSelected }: { onShareSelected: () => void }) {
    const setError = useSetError();

    async function selectShareProgressState(shareProgress: boolean) {
        await service
            .selectShareProgressState(shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error));
    }

    return { selectShareProgressState };
}
