import React, { useContext, useEffect, useState } from "react";
import { Challenge } from "~/challenges/types";
import { Batch, service, UserNote } from "~/service/service";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";
import { useTranslation } from "react-i18next";
import { ChallengesContext } from "~/hooks/useChallenges";

function sameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function getTodayNotes(allNotes: UserNote[]): UserNote[] {
    const today = new Date();
    return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date * 1000), today));
}

function useChallengeView() {
    const { t } = useTranslation(["challenges"]);

    const {
        userInfo, batches, currentBatch, currentDayIndex, challenges,
        fetchUserInfo
    } = useContext(ChallengesContext);

    const [todayChallenges, setTodayChallenges] = useState<Challenge[]>();

    const [newNoteText, setNewNoteText] = useState("");
    const [todayNotes, setTodayNotes] = useState<UserNote[]>();

    useEffect(() => {
        if (userInfo != undefined) {
            if (userInfo.batches.length == 0) {
                return;
            }

            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes);
            setTodayNotes(todaysNotes);
        }
    }, [userInfo]);

    useEffect(() => {
        if (!challenges || !currentBatch || currentDayIndex == undefined)
            return;

        const batchChallenges = challenges.get(currentBatch.id);

        if (!batchChallenges)
            return;

        setTodayChallenges(batchChallenges[currentDayIndex]);
    }, [challenges]);

    async function onMarkCompleteClickHandler(challenge: Challenge, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, challenge.id, challenge.challengeDay)
            .then(() => {
                fetchUserInfo();
            });
    }

    return {
        userInfo,
        currentDayIndex,
        todayChallenges,
        todayNotes,
        newNoteText,
        currentBatch,
        setNewNoteText,
        onMarkCompleteClickHandler
    };
}

export function ChallengeView() {
    const {
        userInfo,
        currentDayIndex,
        todayChallenges,
        todayNotes,
        currentBatch,
        onMarkCompleteClickHandler
    } = useChallengeView();

    if (userInfo && currentDayIndex != undefined && todayChallenges && todayNotes && currentBatch) {
        return (
            <div className={styles.challengesContainerWrapper}>
                <Challenges
                    currentDayNumber={currentDayIndex + 1}
                    challenges={todayChallenges}
                    onMarkComplete={(challenge: Challenge) => onMarkCompleteClickHandler(challenge, currentBatch)} />
            </div>
        );
    } else
        return <></>;
}