import { BatchDay, Challenge } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Batch, service } from "~/service/service";
import styles from "./challengesPage.module.css";
import { useChallenges } from "~/hooks/useChallenges";
import { ChallengesList } from "~/routes/challenges/ChallengesList";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

function useChallengesPage() {
    /* TODO: Check if this is the correct way to handle the state, implement level 3 too*/

    const { batches, currentBatch, currentDayIndex, batchDays, fetchUserInfo } = useChallenges();

    const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>(undefined);

    const [listedBatchDays, setListedBatchDays] = useState<BatchDay[] | undefined>(undefined);

    useEffect(() => {
        if (!batches || !currentBatch) {
            return;
        }

        setSelectedBatch(currentBatch);
    }, [batches, currentBatch]);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const currentBatchDays = batchDays.get(currentBatch.id);

        if (!currentBatchDays)
            return;

        setListedBatchDays(currentBatchDays.slice(0, Math.min(currentDayIndex + 1, 21)));
    }, [batchDays]);

    async function onMarkCompleteClickHandler(challenge: Challenge, batchDay: BatchDay, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, batchDay.id, challenge.id)
            .then(() => {
                fetchUserInfo();
            });
    }

    async function onNoteAddClick(batchDayNumber: number, notesText: string) {
        if (!selectedBatch) {
            return;
        }

        await service.editDayNote(selectedBatch.id, batchDayNumber, notesText)
            .then(() => {
                fetchUserInfo();
            });
    }

    return {
        batches,
        currentBatch,
        batchDays,
        listedBatchDays,
        onMarkCompleteClickHandler,
        selectedBatch,
        onNoteAddClick,
        fetchUserInfo
    };
}

export function ChallengesPage() {
    const { t } = useTranslation(["challenge_overview"]);
    const {
        batches,
        currentBatch,
        batchDays,
        listedBatchDays,
        onMarkCompleteClickHandler,
        selectedBatch,
        onNoteAddClick,
        fetchUserInfo
    } = useChallengesPage();

    return (
        <div className={`${styles.challengesPage}`}>
            <div className={`${styles.mainContent}`}>
                {
                    batches != undefined && currentBatch == undefined ?
                        <>
                            <div className={styles.notOnBatchMessageContainer}>
                                <h1 className={styles.notOnBatchMessage}>
                                    {t("dashboard:not_on_batch_message")}
                                </h1>
                            </div>
                            <SelectLevelPage
                                onLevelSelected={() => {
                                    fetchUserInfo();
                                }}
                                onStartQuizClick={() => {
                                }}
                            />
                        </>
                        :
                        <div className={`${styles.challengesListContainer}`}>
                            <ChallengesList batch={selectedBatch}
                                            batchDays={selectedBatch != undefined ? batchDays?.get(selectedBatch.id) : undefined}
                                            listedBatchDays={listedBatchDays}
                                            onMarkCompleteClickHandler={onMarkCompleteClickHandler}
                                            onNoteAddClick={onNoteAddClick} />
                        </div>
                }
            </div>
        </div>
    );
}

export default function ChallengesPageAuthControlled() {
    return (
        <RequireAuthn>
            <ChallengesPage />
        </RequireAuthn>
    );
}