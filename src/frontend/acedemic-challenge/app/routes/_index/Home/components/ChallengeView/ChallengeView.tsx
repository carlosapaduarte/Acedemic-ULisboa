import React, { useContext, useEffect, useState } from "react";
import { BatchDay, Challenge } from "~/challenges/types";
import { Batch, Badge, service } from "~/service/service";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";
import { ChallengesContext } from "~/hooks/useChallenges";

function useChallengeViewHook() {
    const { currentBatch, currentDayIndex, batchDays } =
        useContext(ChallengesContext);
    const [currentBatchDay, setCurrentBatchDay] = useState<
        BatchDay | undefined
    >(undefined);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex === undefined)
            return;
        const currentBatchDays = batchDays.get(currentBatch.id);
        if (!currentBatchDays) return;
        setCurrentBatchDay(currentBatchDays[currentDayIndex]);
    }, [batchDays, currentBatch, currentDayIndex]);

    return { currentBatchDay };
}

export function ChallengeView({
    onViewNotesButtonClick,
}: {
    onViewNotesButtonClick: () => void;
}) {
    const { userInfo, currentBatch, fetchUserInfo, showBadgeAnimation } =
        useContext(ChallengesContext);
    const { currentBatchDay } = useChallengeViewHook();

    async function onMarkCompleteClickHandler(
        challenge: Challenge,
        batchDay: BatchDay,
        batch: Batch,
        userAnswer: string | null,
    ) {
        try {
            const responseData = await service.markChallengeAsCompleted(
                batch.id,
                batchDay.id,
                challenge.id,
                userAnswer,
            );

            if (responseData) {
                const newlyAwardedBadges: Badge[] =
                    responseData.newly_awarded_badges;
                const completedLevelRank: number | null =
                    responseData.completed_level_rank;

                fetchUserInfo();

                if (newlyAwardedBadges && newlyAwardedBadges.length > 0) {
                    showBadgeAnimation(newlyAwardedBadges[0]);
                }

                if (
                    completedLevelRank !== null &&
                    completedLevelRank !== undefined
                ) {
                    console.log(`Nível ${completedLevelRank} concluído!`);
                    sessionStorage.setItem(
                        "justCompletedLevel",
                        completedLevelRank.toString(),
                    );
                }
            }
        } catch (error) {
            console.error("Erro ao completar desafio:", error);
        }
    }

    if (userInfo && currentBatchDay && currentBatch) {
        return (
            <div className={styles.challengesContainerWrapper}>
                <Challenges
                    currentBatchDay={currentBatchDay}
                    onMarkComplete={(
                        challenge: Challenge,
                        userAnswer: string | null,
                    ) =>
                        onMarkCompleteClickHandler(
                            challenge,
                            currentBatchDay,
                            currentBatch,
                            userAnswer,
                        )
                    }
                    onViewNotesButtonClick={onViewNotesButtonClick}
                />
            </div>
        );
    }

    return <></>;
}
