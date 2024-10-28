import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { BinaryAnswer, service } from "~/service/service";
import styles from "./receiveNotificationsSelectionPage.module.css";
import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

export function ReceiveNotificationsSelectionPage({ onProceed }: { onProceed: () => void }) {
    const { t } = useTranslation(["login"]);

    const setGlobalError = useSetGlobalError();

    function submitReceiveNotPref(answer: BinaryAnswer) {
        service.updateReceiveNotificationsPreference(answer)
            .then(() => onProceed())
            .catch((error) => setGlobalError(error));
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                <h1>{t("login:receive_notification_title")}</h1>
                <br />
                <button className={classNames(styles.roundButton, styles.receiveNotificationsButton, styles.yes)}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.YES)}>
                    {t("login:yes_answer_option")}
                </button>
                <button className={classNames(styles.roundButton, styles.receiveNotificationsButton)}
                        onClick={() => submitReceiveNotPref(BinaryAnswer.NO)}>
                    {t("login:no_answer_option")}
                </button>
            </div>
        </div>
    );
}