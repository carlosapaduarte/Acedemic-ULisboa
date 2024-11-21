import { BatchDay, Challenge } from "~/challenges/types";
import { CutButton } from "~/components/Button/Button";
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
                            <p className={styles.batchDayNotes}>
                                {currentBatchDay.notes != null && currentBatchDay.notes !== ""
                                    ? `${t("dashboard:notes")}: ${currentBatchDay.notes}`
                                    : t("dashboard:no_notes")
                                }
                            </p>
                        </div>
                        <div className={styles.buttonsContainer}>
                            <CutButton className={styles.addNoteButton}
                                       onClick={() => onViewNotesButtonClick()}>
                                {t("dashboard:view_edit_notes")}
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
                            <div style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
                                <h1 className={styles.currentDayText}>
                                    {t("dashboard:day")} {currentDayNumber}
                                </h1>
                                {challenges.map((challenge: Challenge) => {
                                    return (
                                        <div key={challenge.id}
                                             className={styles.challengeContentContainer}
                                             style={{ overflow: "visible" }}>
                                            <div className={styles.challengeContentScrollWrapper}>
                                                <div className={styles.challengeTitleContainer}>
                                                    <h2 className={styles.challengeTitle}>{challenge.title}</h2>
                                                    {
                                                        challenge.completionDate != null ?
                                                            <div className={styles.challengeCompleteTag}>
                                                                {t("dashboard:challenge_completed")}
                                                            </div>
                                                            :
                                                            <></>
                                                    }
                                                </div>
                                                <p className={styles.challengeDescription}>
                                                    {challenge.description}
                                                </p>
                                            </div>
                                        </div>);
                                })}
                            </div>
                        }
                    </>

            }
        </div>
    );
}