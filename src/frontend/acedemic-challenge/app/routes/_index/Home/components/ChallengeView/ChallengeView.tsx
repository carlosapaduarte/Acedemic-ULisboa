import React, { useEffect, useState } from "react";
import { Challenge } from "~/challenges/types";
import { Batch, service, StoredChallenge, UserInfo, UserNote } from "~/service/service";
import { getFullChallenge } from "~/challenges/getLevels";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";
import { useTranslation } from "react-i18next";

function sameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function getTodayNotes(allNotes: UserNote[]): UserNote[] {
    const today = new Date();
    return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date * 1000), today));
}

function useMainDashboardContent() {
    const { t } = useTranslation(["challenges"]);

    const [newNoteText, setNewNoteText] = useState("");

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [currentDayIndex, setCurrentDayIndex] = useState<number>();
    const [todayNotes, setTodayNotes] = useState<UserNote[]>();

    const [currentBatch, setCurrentBatch] = useState<Batch | undefined>(undefined);
    const [storedDayChallenges, setStoredDayChallenges] = useState<StoredChallenge[]>();
    const [todayChallenges, setTodayChallenges] = useState<Challenge[]>();


    // Sparks a getUserInfo API call
    useEffect(() => {
        fetchUserInfo();
    }, []); // Executed only once

    useEffect(() => {
        async function processUserInfo(userInfo: UserInfo) {
            if (userInfo.batches.length == 0) {
                return;
            }

            const currentBatch: Batch = userInfo.batches.sort((a, b) => b.startDate - a.startDate)[0];
            setCurrentBatch(currentBatch);

            const currentDayIndex = Math.round((new Date().getTime() - currentBatch.startDate * 1000) / (1000 * 3600 * 24));
            setCurrentDayIndex(currentDayIndex);

            const storedDayChallenges = userInfo.batches[userInfo.batches.length - 1].challenges[currentDayIndex];
            setStoredDayChallenges(storedDayChallenges);

            let todayChallenges: Challenge[] = storedDayChallenges
                .map((storedChallenge) =>
                    getFullChallenge(currentBatch.level, storedChallenge, t)
                );

            setTodayChallenges(todayChallenges);

            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes);
            setTodayNotes(todaysNotes);
        }

        if (userInfo != undefined)
            processUserInfo(userInfo);

    }, [userInfo]);

    useEffect(() => {
        if (!currentBatch || !storedDayChallenges)
            return;

        let todayChallenges: Challenge[] = storedDayChallenges
            .map((storedChallenge) =>
                getFullChallenge(currentBatch.level, storedChallenge, t)
            );

        setTodayChallenges(todayChallenges);
    }, [storedDayChallenges, t]);

    async function fetchUserInfo() {
        const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi(); // TODO: in future, request only today's challenges

        if (userInfo == undefined) {
            return;
        }

        setUserInfo(userInfo);
    }

    async function onMarkCompleteClickHandler(challenge: Challenge, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, challenge.id, challenge.day)
            .then(() => {
                fetchUserInfo();
            }); // this triggers a new refresh. TODO: improve later
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

function MainContent() {
    const {
        userInfo,
        currentDayIndex,
        todayChallenges,
        todayNotes,
        currentBatch,
        onMarkCompleteClickHandler
    } = useMainDashboardContent();

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

export function ChallengeView() {
    return (<MainContent />);
}