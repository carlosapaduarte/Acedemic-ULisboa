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
        idCount,
        completedIdCount,
        challengeTitle,
        challengeDescription,
        onMarkComplete
    }: {
        completed: boolean,
        idCount: number,
        completedIdCount: number,
        challengeTitle: string,
        challengeDescription: string,
        onMarkComplete: () => void
    }) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    const challengeCompletionPercentage = (completedIdCount / idCount * 100).toFixed(2);

    return (
        <div className={classNames(styles.challengeBoxLvl3)}>
            <div className={`${styles.challengeBoxHeader}`}>
                <div className={styles.challengeBoxChallengeCompletionIndicatorContainer}>
                    <div className={styles.challengeBoxChallengeCompletionIndicator}>
                        <div className={styles.challengeBoxChallengeCompletionIndicatorPercentage}>
                            {challengeCompletionPercentage}%
                        </div>
                        <div className={styles.challengeBoxChallengeCompletionIndicatorFraction}>
                            ({completedIdCount}/{idCount})
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
        listedBatchDays,
        onMarkCompleteClickHandler,
        onNoteAddClick
    }: {
        batch: Batch,
        batchDays: BatchDay[],
        listedBatchDays: BatchDay[],
        onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
        onNoteAddClick: (batchDayNumber: number, notesText: string) => void
    }
) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const currentBatchDayNumber: number = listedBatchDays.length;

    const notes = listedBatchDays[currentBatchDayNumber - 1].notes;

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
                {listedBatchDays[currentBatchDayNumber - 1]
                    .challenges
                    .sort((a, b) => a.id - b.id)
                    .map((challenge, index) => {
                        const idCount = batchDays.flatMap(batchDay => batchDay.challenges)
                            .filter(challenge_IdCount => challenge_IdCount.id == challenge.id).length;
                        const completedIdCount = batchDays.flatMap(batchDay => batchDay.challenges)
                            .filter(challenge_IdCount => challenge_IdCount.id == challenge.id && challenge_IdCount.completionDate != null).length;

                        return <Level3ChallengeListItem
                            key={index}
                            completed={challenge.completionDate != null}
                            idCount={idCount}
                            completedIdCount={completedIdCount}
                            challengeTitle={challenge.title}
                            challengeDescription={challenge.description}
                            onMarkComplete={() => {
                                onMarkCompleteClickHandler(challenge, listedBatchDays[currentBatchDayNumber - 1], batch);
                            }}
                        />;
                    })
                }
            </div>
        </>
    );
}