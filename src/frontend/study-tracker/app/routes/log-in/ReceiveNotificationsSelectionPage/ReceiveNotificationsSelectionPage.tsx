import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { BinaryAnswer, service } from "~/service/service";
import styles from "./receiveNotificationsSelectionPage.module.css";
import React from "react";
import classNames from "classnames";

export function ReceiveNotificationsSelectionPage({ onProceed }: { onProceed: () => void }) {
    const setError = useSetGlobalError();

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
                <button className={classNames(styles.roundButton, styles.receiveNotificationsButton, styles.yes)}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.YES)}>
                    Yes
                </button>
                <button className={classNames(styles.roundButton, styles.receiveNotificationsButton)}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.NO)}>
                    No
                </button>
            </div>
        </div>
    );
}