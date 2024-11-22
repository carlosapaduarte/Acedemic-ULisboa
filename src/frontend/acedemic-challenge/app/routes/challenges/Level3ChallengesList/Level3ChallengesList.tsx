import React, { useState } from "react";
import { Batch } from "~/service/service";
import { BatchDay, Challenge } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { NotesModal } from "~/components/NotesModal/NotesModal";
import styles from "./lvl3ChallengesList.module.css";


function Level3ChallengeListItem(
    {
        completed,
        challengeIndex,
        challengeTitle,
        challengeDescription,
        onMarkComplete
    }: {
        completed: boolean,
        challengeIndex: number,
        challengeTitle: string,
        challengeDescription: string,
        onMarkComplete: () => void
    }) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    return (
        <div className={classNames(styles.challengeBoxLvl3)}>
            <div className={`${styles.challengeBoxHeader}`}>
                <div className={styles.challengeBoxChallengeCompletionIndicatorContainer}>
                    <div className={styles.challengeBoxChallengeCompletionIndicator}>
                        <div className={styles.challengeBoxChallengeCompletionIndicatorPercentage}>
                            52.38%
                        </div>
                        <div className={styles.challengeBoxChallengeCompletionIndicatorFraction}>
                            (11/21)
                        </div>
                    </div>
                </div>
                <div className={styles.challengeBoxHeaderText}>
                <p className={`${styles.challengeTitle}`}>
                    {challengeTitle}
                </p>
                {
                    completed ?
                        <div className={styles.challengeCompleteTag}>
                            {t("dashboard:challenge_completed")}
                        </div>
                        :
                        <div className={styles.challengeIncompleteTag}>
                            {t("dashboard:challenge_incomplete")}
                        </div>
                }
                </div>
            </div>
            <div className={`${styles.challengeDescription}`}>
                {challengeDescription}
            </div>
            {
                !completed &&
                    <div className={styles.completeChallengeButtonContainer}>
                        <button className={styles.completeChallengeButton}
                                onClick={() => onMarkComplete()}
                        >
                            {t("dashboard:mark_complete")}
                        </button>
                    </div>
            }
        </div>
    );
}

export function Level3ChallengesList(
    {
        batch,
        batchDays,
        onMarkCompleteClickHandler,
        onNoteAddClick
    }: {
        batch: Batch,
        batchDays: BatchDay[],
        onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
        onNoteAddClick: (batchDayNumber: number, notesText: string) => void
    }
) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const currentBatchDayNumber: number = batchDays.length;

    const notes = batchDays[currentBatchDayNumber - 1].notes;

    return (
        <>
            <NotesModal batchDayNumber={currentBatchDayNumber}
                        isModalOpen={isNotesModalOpen}
                        setIsModalOpen={setIsNotesModalOpen}
                        savedNotesText={notes ?? ""}
                        onNotesSave={(notesText) => {
                            onNoteAddClick(currentBatchDayNumber, notesText);
                        }}
            />
            <h1 className={styles.challengesPageLevel3Title}>
                {t("challenge_overview:day", { day: currentBatchDayNumber })}
            </h1>
            <div className={styles.viewEditNotesButtonContainer}>
                <button className={styles.viewEditNotesButton}
                        onClick={() => setIsNotesModalOpen(true)}
                >
                    {t("dashboard:view_edit_notes")}
                </button>
            </div>
            <div className={styles.challengesList}>
                {batchDays[currentBatchDayNumber - 1]
                    .challenges
                    .sort((a, b) => a.id - b.id)
                    .map((challenge, index) => {
                        const title = challenge.title;
                        const description = challenge.description;
                        const completed = challenge.completionDate != null;

                        return <Level3ChallengeListItem
                            key={index}
                            completed={completed}
                            challengeIndex={index}
                            challengeTitle={title}
                            challengeDescription={description}
                            onMarkComplete={() => {
                                onMarkCompleteClickHandler(challenge, batchDays[currentBatchDayNumber - 1], batch);
                            }}
                        />;
                    })
                }
            </div>
        </>
    );
}