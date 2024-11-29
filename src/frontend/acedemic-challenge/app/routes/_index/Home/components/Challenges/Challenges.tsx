import { BatchDay, Challenge } from "~/challenges/types";
import React from "react";

import styles from "./challenges.module.css";
import { useTranslation } from "react-i18next";

export default function Challenges({ currentBatchDay, onMarkComplete, onViewNotesButtonClick }: {
    currentBatchDay: BatchDay,
    onMarkComplete: (challenge: Challenge) => void,
    onViewNotesButtonClick: () => void
}) {
    const { t } = useTranslation(["dashboard"]);

    const currentDayNumber = currentBatchDay.id;
    const challenges = currentBatchDay.challenges;

    // Per challenge, there is a "Mark Complete" button
    return (
        <div className={styles.challengeWrapper}>
            {
                currentBatchDay.level == 1 || currentBatchDay.level == 2 ?
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
                                        <div className={styles.challengeIncompleteTag}>
                                            {t("dashboard:challenge_incomplete")}
                                        </div>
                                }
                            </div>
                            <p className={styles.challengeDescription}>
                                {challenges[0].description}
                            </p>
                            <p className={styles.batchDayNotes}>
                                {currentBatchDay.notes != null && currentBatchDay.notes !== ""
                                    ? `${t("dashboard:notes")}: ${currentBatchDay.notes}`
                                    : t("dashboard:no_notes")
                                }
                            </p>
                        </div>
                        <div className={styles.buttonsContainer}>
                            <button className={styles.viewEditNotesButton}
                                    onClick={() => onViewNotesButtonClick()}>
                                {t("dashboard:view_edit_notes")}
                            </button>
                            {
                                challenges[0].completionDate != null ?
                                    <></>
                                    :
                                    <button className={styles.completeChallengeButton}
                                            onClick={() => onMarkComplete(challenges[0])}>
                                        {t("dashboard:mark_complete")}
                                    </button>
                            }
                        </div>
                    </div>
                    :
                    <>
                        {
                            <div style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
                                <h1 className={styles.currentDayText}>
                                    {t("dashboard:day")} {currentDayNumber}
                                </h1>
                                <div className={styles.dayContentContainer}>
                                    <div className={styles.dayContentScrollWrapper}>
                                        {challenges.map((challenge: Challenge) => {
                                            return (
                                                <div key={challenge.id}
                                                     className={styles.challengeContentContainer}>
                                                    <div className={styles.challengeContentScrollWrapper}>
                                                        <div className={styles.challengeTitleContainer}>
                                                            <h2 className={styles.challengeTitle}>{challenge.title}</h2>
                                                            {
                                                                challenge.completionDate != null ?
                                                                    <div className={styles.challengeCompleteTag}>
                                                                        {t("dashboard:challenge_completed")}
                                                                    </div>
                                                                    :
                                                                    <div className={styles.challengeIncompleteTag}>
                                                                        {t("dashboard:challenge_incomplete")}
                                                                    </div>
                                                            }
                                                        </div>
                                                        <p className={styles.challengeDescription}>
                                                            {challenge.description}
                                                        </p>
                                                        {
                                                            challenge.completionDate != null ?
                                                                <></>
                                                                :
                                                                <div className={styles.buttonsContainer}>

                                                                    <button className={styles.completeChallengeButton}
                                                                            onClick={() => onMarkComplete(challenge)}>
                                                                        {t("dashboard:mark_complete")}
                                                                    </button>

                                                                </div>
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className={styles.buttonsContainer}>
                                    <button className={styles.viewEditNotesButton}
                                            onClick={() => onViewNotesButtonClick()}>
                                        {t("dashboard:view_edit_notes")}
                                    </button>
                                </div>
                            </div>
                        }
                    </>

            }
        </div>
    );
}