import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Batch, service, UserInfo } from "~/service/service";
import { Challenge } from "~/challenges/types";
import { getFullChallenge } from "~/challenges/getLevels";

export function useChallenges() {
    const { t } = useTranslation(["challenges"]);

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
    const [currentBatch, setCurrentBatch] = useState<Batch | undefined>(undefined);
    const [currentDayIndex, setCurrentDayIndex] = useState<number | undefined>(undefined);
    const [challenges, setChallenges] = useState<Map<number, Challenge[][]> | undefined>(undefined);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (!batches || !currentBatch) {
            return;
        }

        // Create a map to store challenges for each batch, keyed by batchId
        const challengesMap = new Map<number, Challenge[][]>();
        batches.forEach(batch => {
            challengesMap.set(batch.id, getFullChallenges(batch));
        });
        setChallenges(challengesMap);
    }, [batches, t]);

    function getFullChallenges(batch: Batch): Challenge[][] {
        return batch.challenges
            .map((storedChallengeList) =>
                storedChallengeList
                    .map((storedChallenge) =>
                        getFullChallenge(batch.level, storedChallenge, t)
                    )
            );
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

                const DEBUG_DAY_OFFSET = 6;
                const DEBUG_TIME_OFFSET = 1000 * 3600 * 24 * DEBUG_DAY_OFFSET;

                // Calculate the current day index for the most recent batch
                const currentDayIndex = Math.round(((new Date().getTime() + DEBUG_TIME_OFFSET) - currentBatch.startDate * 1000) / (1000 * 3600 * 24));
                setCurrentDayIndex(currentDayIndex);
            });
    }

    return { userInfo, batches, currentBatch, currentDayIndex, challenges, fetchUserInfo };
}