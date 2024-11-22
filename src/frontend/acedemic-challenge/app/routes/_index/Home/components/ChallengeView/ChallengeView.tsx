import React, { useContext, useEffect, useState } from "react";
import { BatchDay, Challenge } from "~/challenges/types";
import { Batch, service } from "~/service/service";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";
import { useTranslation } from "react-i18next";
import { ChallengesContext } from "~/hooks/useChallenges";

function useChallengeView() {
    const { t } = useTranslation(["challenges"]);

    const {
        userInfo, batches, currentBatch, currentDayIndex, batchDays,
        fetchUserInfo
    } = useContext(ChallengesContext);
    const [newNoteText, setNewNoteText] = useState("");

    const [currentBatchDay, setCurrentBatchDay] = useState<BatchDay | undefined>(undefined);

    useEffect(() => {
        if (userInfo != undefined) {
            if (userInfo.batches.length == 0) {
                return;
            }
        }
    }, [userInfo]);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const currentBatchDays = batchDays.get(currentBatch.id);

        if (!currentBatchDays)
            return;

        setCurrentBatchDay(currentBatchDays[currentDayIndex]);
    }, [batchDays]);

    async function onMarkCompleteClickHandler(challenge: Challenge, batchDay: BatchDay, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, batchDay.id, challenge.id)
            .then(() => {
                fetchUserInfo();
            });
    }

    return {
        userInfo,
        currentBatchDay,
        newNoteText,
        currentBatch,
        setNewNoteText,
        onMarkCompleteClickHandler
    };
}

export function ChallengeView({ onViewNotesButtonClick }: { onViewNotesButtonClick: () => void }) {
    const {
        userInfo,
        currentBatchDay,
        currentBatch,
        onMarkCompleteClickHandler
    } = useChallengeView();

    if (userInfo && currentBatchDay != undefined && currentBatch) {
        return (
            <div className={styles.challengesContainerWrapper}>
                <Challenges
                    currentBatchDay={currentBatchDay}
                    onMarkComplete={(challenge: Challenge) =>
                        onMarkCompleteClickHandler(challenge, currentBatchDay, currentBatch)}
                    onViewNotesButtonClick={onViewNotesButtonClick} />
            </div>
        );
    } else
        return <></>;
}