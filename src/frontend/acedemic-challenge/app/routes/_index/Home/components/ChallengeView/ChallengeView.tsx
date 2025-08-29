import React, { useContext, useEffect, useState } from "react";
import { BatchDay, Challenge } from "~/challenges/types";
import { Batch } from "~/service/service";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";
import { ChallengesContext } from "~/hooks/useChallenges";
import { Badge } from "~/types/Badge";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
    const token = localStorage.getItem("jwt");

    async function onMarkCompleteClickHandler(
        challenge: Challenge,
        batchDay: BatchDay,
        batch: Batch,
    ) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/academic-challenge/users/me/batches/${batch.id}/${batchDay.id}/completed-challenges`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ challengeId: challenge.id }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || "Falha ao marcar desafio como completo",
                );
            }

            const newlyAwardedBadges: Badge[] = await response.json();
            fetchUserInfo();

            if (newlyAwardedBadges.length > 0) {
                const firstBadge = newlyAwardedBadges[0];
                showBadgeAnimation(firstBadge);

                const isLevelUpBadge =
                    firstBadge.code.includes("iniciante_determinado") ||
                    firstBadge.code.includes("cavaleiro_persistencia") ||
                    firstBadge.code.includes("campeao_autoeficacia");
            }
        } catch (error) {
            console.error("Erro ao completar desafio:", error);
        }
    }

    if (userInfo && currentBatchDay && currentBatch) {
        return (
            <>
                <div className={styles.challengesContainerWrapper}>
                    <Challenges
                        currentBatchDay={currentBatchDay}
                        onMarkComplete={(challenge: Challenge) =>
                            onMarkCompleteClickHandler(
                                challenge,
                                currentBatchDay,
                                currentBatch,
                            )
                        }
                        onViewNotesButtonClick={onViewNotesButtonClick}
                    />
                </div>
            </>
        );
    }

    return <></>;
}
