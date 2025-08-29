import { useTranslation } from "react-i18next";
import { createContext, useEffect, useState } from "react";
import { BatchDay } from "~/challenges/types";
import { getFullChallenge } from "~/challenges/getLevels";
import {
    Batch,
    service,
    UserInfo,
    AwardedBadgeHistoryItem,
} from "~/service/service";
import type { Badge } from "~/types/Badge";

export const ChallengesContext = createContext<{
    userInfo: UserInfo | undefined;
    batches: Batch[] | undefined;
    currentBatch: Batch | undefined;
    currentDayIndex: number | undefined;
    batchDays: Map<number, BatchDay[]> | undefined;
    badgeHistory: AwardedBadgeHistoryItem[];
    fetchUserInfo: () => void;
    // Lógica para a animação
    badgeForAnimation: Badge | null;
    showBadgeAnimation: (badge: Badge) => void;
    clearBadgeAnimation: () => void;
}>({
    userInfo: undefined,
    batches: undefined,
    currentBatch: undefined,
    currentDayIndex: undefined,
    batchDays: undefined,
    badgeHistory: [],
    fetchUserInfo: () => {},
    // Valores iniciais para a animação
    badgeForAnimation: null,
    showBadgeAnimation: () => {},
    clearBadgeAnimation: () => {},
});

export function useChallenges() {
    const { t } = useTranslation(["challenges"]);

    const [userInfo, setUserInfo] = useState<UserInfo>();
    const [badgeHistory, setBadgeHistory] = useState<AwardedBadgeHistoryItem[]>(
        [],
    );

    const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
    const [currentBatch, setCurrentBatch] = useState<Batch | undefined>(
        undefined,
    );
    const [currentDayIndex, setCurrentDayIndex] = useState<number | undefined>(
        undefined,
    );
    const [batchDays, setBatchDays] = useState<
        Map<number, BatchDay[]> | undefined
    >(undefined);

    const [badgeForAnimation, setBadgeForAnimation] = useState<Badge | null>(
        null,
    );
    const showBadgeAnimation = (badge: Badge) => setBadgeForAnimation(badge);
    const clearBadgeAnimation = () => setBadgeForAnimation(null);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (batches == undefined) {
            return;
        }

        // Create a map to store batch days for each batch, keyed by batchId
        const batchDaysMap = new Map<number, BatchDay[]>();
        batches.forEach((batch) => {
            batchDaysMap.set(batch.id, getFullBatchDays(batch));
        });
        setBatchDays(batchDaysMap);
    }, [batches, t]);

    function getFullBatchDays(batch: Batch): BatchDay[] {
        return batch.batchDays
            .sort((a, b) => a.id - b.id)
            .map((storedBatchDay) => ({
                id: storedBatchDay.id,
                challenges: storedBatchDay.challenges.map((storedChallenge) =>
                    getFullChallenge(batch.level, storedChallenge, t),
                ),
                notes: storedBatchDay.notes,
                date: new Date(
                    batch.startDate * 1000 +
                        1000 * 3600 * 24 * (storedBatchDay.id - 1),
                ),
                level: batch.level,
            }));
    }

    function fetchUserInfo() {
        Promise.all([
            service.fetchUserInfoFromApi(),
            service.fetchBadgeHistory(),
        ])
            .then(([userInfoData, historyData]) => {
                setUserInfo(userInfoData);
                setBadgeHistory(historyData);

                const sortedBatches = userInfoData.batches.sort(
                    (a, b) => b.startDate - a.startDate,
                );
                setBatches(sortedBatches);

                if (sortedBatches.length > 0) {
                    const latestBatch: Batch = sortedBatches[0];
                    const dayIndex = Math.floor(
                        (new Date().getTime() - latestBatch.startDate * 1000) /
                            (1000 * 3600 * 24),
                    );

                    if (
                        dayIndex >= 0 &&
                        dayIndex < latestBatch.batchDays.length
                    ) {
                        setCurrentBatch(latestBatch);
                        setCurrentDayIndex(dayIndex);
                    }
                }
            })
            .catch((error) => {
                console.error(
                    "Falha ao carregar dados do utilizador ou histórico de medalhas",
                    error,
                );
            });
    }

    return {
        userInfo,
        batches,
        currentBatch,
        currentDayIndex,
        batchDays,
        badgeHistory,
        fetchUserInfo,
        badgeForAnimation,
        showBadgeAnimation,
        clearBadgeAnimation,
    };
}
