import { useTranslation } from "react-i18next";
import { createContext, useEffect, useState } from "react";
import { Batch, service, UserInfo } from "~/service/service";
import { BatchDay } from "~/challenges/types";
import { getFullChallenge } from "~/challenges/getLevels";

export const ChallengesContext = createContext<{
    userInfo: UserInfo | undefined,
    batches: Batch[] | undefined,
    currentBatch: Batch | undefined,
    currentDayIndex: number | undefined,
    batchDays: Map<number, BatchDay[]> | undefined,
    fetchUserInfo: () => void
}>({
    userInfo: undefined,
    batches: undefined,
    currentBatch: undefined,
    currentDayIndex: undefined,
    batchDays: undefined,
    fetchUserInfo: () => {
    }
});

export function useChallenges() {
    const { t } = useTranslation(["challenges"]);

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
    const [currentBatch, setCurrentBatch] = useState<Batch | undefined>(undefined);
    const [currentDayIndex, setCurrentDayIndex] = useState<number | undefined>(undefined);
    const [batchDays, setBatchDays] = useState<Map<number, BatchDay[]> | undefined>(undefined);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (!batches || !currentBatch) {
            return;
        }

        // Create a map to store batch days for each batch, keyed by batchId
        const batchDaysMap = new Map<number, BatchDay[]>();
        batches.forEach(batch => {
            batchDaysMap.set(batch.id, getFullBatchDays(batch));
        });
        setBatchDays(batchDaysMap);
    }, [batches, t]);

    function getFullBatchDays(batch: Batch): BatchDay[] {
        return batch.batchDays
            .sort((a, b) => a.id - b.id)
            .map((storedBatchDay) => ({
                id: storedBatchDay.id,
                challenges: storedBatchDay.challenges.map((storedChallenge) => getFullChallenge(batch.level, storedChallenge, t)),
                notes: storedBatchDay.notes,
                date: new Date(batch.startDate * 1000 + 1000 * 3600 * 24 * storedBatchDay.id)
            }));
    }

    function fetchUserInfo() {
        service.fetchUserInfoFromApi()
            .then((userInfo: UserInfo) => {
                setUserInfo(userInfo);

                // Sort batches by start date (descending)
                const sortedBatches = userInfo.batches.sort((a, b) => b.startDate - a.startDate);
                setBatches(sortedBatches);

                // Set the current batch to the most recent
                const currentBatch: Batch = sortedBatches[0];
                setCurrentBatch(currentBatch);

                const DEBUG_DAY_OFFSET = 15;
                const DEBUG_TIME_OFFSET = 1000 * 3600 * 24 * DEBUG_DAY_OFFSET;

                // Calculate the current day index for the most recent batch
                const currentDayIndex = Math.round(((new Date().getTime() + DEBUG_TIME_OFFSET) - currentBatch.startDate * 1000) / (1000 * 3600 * 24));
                setCurrentDayIndex(currentDayIndex);
            });
    }

    return { userInfo, batches, currentBatch, currentDayIndex, batchDays, fetchUserInfo };
}