import { useSetError } from "~/components/error/ErrorContainer";
import { BinaryAnswer, service } from "~/service/service";
import styles from "./receiveNotificationsSelectionPage.module.css";
import { Button } from "~/components/Button/Button";
import React from "react";

export function ReceiveNotificationsSelectionPage({ onProceed }: { onProceed: () => void }) {
    const setError = useSetError();

    function submitReceiveNotPref(answer: BinaryAnswer) {
        const userIdStr = localStorage["userId"];
        const userId = Number(userIdStr);
        service.updateReceiveNotificationsPreference(userId, answer)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1>Receive Notifications</h1>
                <br />
                <Button variant={"round"} className={`${styles.receiveNotificationsButton} ${styles.yes}`}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.YES)}>
                    Yes
                </Button>
                <Button variant={"round"} className={`${styles.receiveNotificationsButton}`}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.NO)}>
                    No
                </Button>
            </div>
        </div>
    );
}