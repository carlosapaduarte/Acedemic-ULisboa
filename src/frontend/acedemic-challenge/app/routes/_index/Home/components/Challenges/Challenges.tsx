import { Challenge } from "~/challenges/types";
import { CutButton } from "~/components/Button/Button";
import React from "react";

import styles from "./challenges.module.css";
import { useTranslation } from "react-i18next";

export default function Challenges({ currentDayNumber, challenges, onMarkComplete }: {
    currentDayNumber: number,
    challenges: Challenge[],
    onMarkComplete: (challenge: Challenge) => void
}) {
    const { t } = useTranslation(["dashboard"]);

    // Per challenge, there is a "Mark Complete" button
    return (
        <div className={styles.challengeWrapper}>
            {
                challenges.length == 1 ?
                    <div key={challenges[0].id}
                         className={styles.challengeContentContainer}>
                        <div className={styles.challengeContentScrollWrapper}>
                            <h1 className={styles.currentDayText}>
                                {t("dashboard:day")} {currentDayNumber}
                            </h1>
                            <div className={styles.challengeTitleContainer}>
                                <h2 className={styles.challengeTitle}>{challenges[0].title}</h2>
                                {
                                    challenges[0].completionDate != null ?
                                        <div className={styles.challengeCompleteTag}>
                                            {t("dashboard:challenge_completed")}
                                        </div>
                                        :
                                        <></>
                                }
                            </div>
                            <p className={styles.challengeDescription}>
                                {challenges[0].description}
                            </p>
                        </div>
                        <div className={styles.buttonsContainer}>
                            <CutButton className={styles.addNoteButton}>
                                {t("dashboard:add_note")}
                            </CutButton>
                            {
                                challenges[0].completionDate != null ?
                                    <></>
                                    :
                                    <CutButton className={styles.completeChallengeButton}
                                               onClick={() => onMarkComplete(challenges[0])}>
                                        {t("dashboard:mark_complete")}
                                    </CutButton>
                            }
                        </div>
                    </div>
                    :
                    <>
                        {
                            challenges.map((challenge: Challenge) => {
                                return challenge.title;
                            })
                        }
                    </>

            }
        </div>
    );
}