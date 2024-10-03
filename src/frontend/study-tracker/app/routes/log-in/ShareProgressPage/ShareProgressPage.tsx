import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import styles from "./shareProgressPage.module.css";
import React from "react";
import classNames from "classnames";
import { t } from "i18next";

function useShareProgressPage({ onShareSelected }: { onShareSelected: () => void }) {
    const setError = useSetGlobalError();

    async function selectShareProgressState(shareProgress: boolean) {
        await service
            .selectShareProgressState(shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error));
    }

    return { selectShareProgressState };
}

export function ShareProgressPage(
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
                    {t("login:share_progress_question")}
                </h1>
                <br />
                <button
                    className={classNames(styles.roundButton, styles.shareProgressButton, styles.yes)}
                    onClick={() => {
                        selectShareProgressState(true);
                    }}
                >
                    {t("login:yes_answer_option")}
                </button>
                <button
                    className={classNames(styles.roundButton, styles.shareProgressButton)}
                    onClick={() => {
                        selectShareProgressState(false);
                    }}
                >
                    {t("login:no_answer_option")}
                </button>
            </div>
        </div>
    );
}