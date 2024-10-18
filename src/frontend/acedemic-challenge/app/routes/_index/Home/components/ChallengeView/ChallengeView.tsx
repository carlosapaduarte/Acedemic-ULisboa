import React, { useEffect, useState } from "react";
import { Challenge, DayChallenges } from "~/challenges/types";
import { Batch, CompletedChallenge, service, UserInfo, UserNote } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { Level1 } from "~/challenges/level_1";
import { Level2 } from "~/challenges/level_2";
import { Level3 } from "~/challenges/level_3";
import Challenges from "~/routes/_index/Home/components/Challenges/Challenges";
import styles from "./challengeView.module.css";

function sameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function getTodayChallenges(allChallenges: DayChallenges[]): DayChallenges | undefined {
    const today = new Date();
    return allChallenges.find((challengesForTheDay: DayChallenges) => sameDate(challengesForTheDay.date, today));
}

function getTodayNotes(allNotes: UserNote[]): UserNote[] {
    const today = new Date();
    return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date * 1000), today));
}

function getTodayCompletedChallenges(batch: Batch): number[] {
    const today = new Date();
    const batchStartDate = new Date(batch.startDate * 1000);
    //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...
    return batch.completedChallenges
        .filter((completedChallenge: CompletedChallenge) => {
            // To obtain the date of the challenge: batch-start-date + (challenge day index - 1)
            const challengeDate = batchStartDate;
            challengeDate.setDate(challengeDate.getDate() + (completedChallenge.challengeDay - 1));

            return sameDate(new Date(challengeDate), today);
        }).map((completedChallenge) => completedChallenge.id);
}

function useMainDashboardContent() {
    const setError = useSetGlobalError();
    const [newNoteText, setNewNoteText] = useState("");

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [daysSinceStart, setDaysSinceStart] = useState<number>();
    const [todayCompletedChallenges, setTodayCompletedChallenges] = useState<number[]>();
    const [todayNotes, setTodayNotes] = useState<UserNote[]>();
    const [todayChallenges, setTodayChallenges] = useState<DayChallenges>();
    const [batchToDisplay, setBatchToDisplay] = useState<Batch | undefined>(undefined);

    const [loadingChallengesAndNotes, setLoadingChallengesAndNotes] = useState(false);

    // Sparks a getUserInfo API call
    useEffect(() => {
        fetchUserInfo();
    }, []); // Executed only once

    useEffect(() => {
        async function processUserInfo(userInfo: UserInfo) {
            if (userInfo.batches.length == 0) {
                return;
            }

            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0];
            setBatchToDisplay(batchToDisplay);
            const batchStartDate = new Date(batchToDisplay.startDate * 1000); // Feel free to change for testing
            //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...

            const level = batchToDisplay.level;
            let challenges: DayChallenges[];
            switch (level) {
                case 1:
                    challenges = Level1.level1Challenges(batchStartDate);
                    break;
                case 2:
                    challenges = Level2.level2Challenges(batchStartDate);
                    break;
                case 3:
                    challenges = Level3.level3Challenges(batchStartDate);
                    break;
                default:
                    return Promise.reject("TODO: error handling");
            }

            // Should never be undefined!
            // TODO: handle error when undefined later
            const todayChallengesAux: DayChallenges | undefined = getTodayChallenges(challenges);
            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes);
            const todaysCompletedChallenges: number[] = getTodayCompletedChallenges(batchToDisplay);

            setTodayChallenges(todayChallengesAux);
            setTodayCompletedChallenges(todaysCompletedChallenges);
            setTodayNotes(todaysNotes);
        }

        if (userInfo != undefined)
            processUserInfo(userInfo);

    }, [userInfo]);

    async function fetchUserInfo() {
        setLoadingChallengesAndNotes(true);

        // TODO: in future, request only today's challenges
        const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi();
        //console.log('User Info: ', userInfo)

        setLoadingChallengesAndNotes(false);

        if (userInfo == undefined) {
            setError(new Error("User information could not be obtained!"));
            return;
        }

        setUserInfo(userInfo);
    }

    /*function onAddNewNoteClickHandler() {
        setView(View.CreateNewNote);
    }

    async function onConfirmNewNoteSubmitClickHandler() {
        await service.createNewUserNote(userId, newNoteText, new Date())
            .then(() => {
                fetchUserInfo(); // Updates state again
                setView(View.Default);
            }) // this triggers a new refresh. TODO: improve later)
            .catch((error) => setError(error));
    }*/

    async function onMarkCompleteClickHandler(challenge: Challenge, batch: Batch) {
        const today = new Date();
        const startDate = new Date(batch.startDate * 1000);
        //const startDate = new Date(2024, 7, 21, 12) // For testing...
        const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const challengeIndex = elapsedDays + 1;

        await service.markChallengeAsCompleted(batch.id, challenge.id, challengeIndex)
            .then(() => {
                fetchUserInfo(); // Updates state again
            }) // this triggers a new refresh. TODO: improve later
            .catch((error) => setError(error));
    }

    useEffect(() => {
        if (!batchToDisplay)
            return;

        setDaysSinceStart(Math.round((new Date().getTime() - batchToDisplay.startDate * 1000) / (1000 * 3600 * 24)) + 1);
    }, [batchToDisplay]);

    return {
        userInfo,
        daysSinceStart,
        todayChallenges,
        todayCompletedChallenges,
        todayNotes,
        newNoteText,
        batchToDisplay,
        setError,
        setNewNoteText,
        /*
        onAddNewNoteClickHandler,
        onConfirmNewNoteSubmitClickHandler,*/
        onMarkCompleteClickHandler
    };
}

function MainContent() {
    const {
        userInfo,
        daysSinceStart,
        todayChallenges,
        todayCompletedChallenges,
        todayNotes,
        newNoteText,
        batchToDisplay,
        setError,
        setNewNoteText,
        /*
        onAddNewNoteClickHandler,
        onConfirmNewNoteSubmitClickHandler,*/
        onMarkCompleteClickHandler
    } = useMainDashboardContent();
    /*console.log(userInfo?.avatarFilename);*/
    if (userInfo && daysSinceStart && todayChallenges && todayCompletedChallenges && todayNotes && batchToDisplay) {
        return (
            <div className={styles.challengesContainerWrapper}>
                <Challenges
                    currentDayNumber={daysSinceStart}
                    challenges={todayChallenges.challenges}
                    completedChallenges={todayCompletedChallenges}
                    onMarkComplete={(challenge: Challenge) => onMarkCompleteClickHandler(challenge, batchToDisplay)} />
                {/*<div style={{ flexGrow: 1 }}>
                    <DisplayUserNotes notes={todayNotes} alignTitleLeft={true} />
                </div>
                <div style={{ display: "flex", justifyContent: "right" }}>

                    <Button variant="round" style={{ fontSize: "150%" }}
                                onClick={onAddNewNoteClickHandler}>
                            {t("dashboard:add_note")}
                        </Button>
                </div>*/}
            </div>
        );
    } else
        return <></>;
    /*} else if (view == View.CreateNewNote)
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                {/!*<TextField
                    sx={{ marginBottom: "2%", width: "60%" }}
                    id="outlined-controlled"
                    label="Note Description"
                    value={newNoteText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setNewNoteText(event.target.value);
                    }}
                />*!/}
                <Button variant="round" style={{ width: "15%" }} onClick={onConfirmNewNoteSubmitClickHandler}>
                    {t("dashboard:confirm_new_note")}
                </Button>
            </div>
        );
    else {
        setError(new Error("Something went wrong..."));
        return <></>;
    }*/
}

export function ChallengeView() {
    return (<MainContent />);
}