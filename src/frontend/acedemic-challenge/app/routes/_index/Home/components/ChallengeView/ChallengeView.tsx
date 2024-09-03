import { useUserId } from "~/components/auth/Authn";
import React, { useEffect, useState } from "react";
import { DayGoals, Goal } from "~/challenges/types";
import { Batch, CompletedGoal, service, UserInfo, UserNote } from "~/service/service";
import { useSetError } from "~/components/error/ErrorContainer";
import { Level1 } from "~/challenges/level_1";
import { Level2 } from "~/challenges/level_2";
import { Level3 } from "~/challenges/level_3";
import Goals from "~/routes/_index/Home/components/Goals/Goals";
import styles from "./challengeView.module.css";

function sameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

function getTodayGoals(allGoals: DayGoals[]): DayGoals | undefined {
    const today = new Date();
    //console.log('All goals: ', allGoals)
    return allGoals.find((goalsForTheDay: DayGoals) => sameDate(goalsForTheDay.date, today));
}

function getTodayNotes(allNotes: UserNote[]): UserNote[] {
    const today = new Date();
    return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date * 1000), today));
}

function getTodayCompletedGoals(batch: Batch): number[] {
    const today = new Date();
    const batchStartDate = new Date(batch.startDate * 1000);
    //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...
    return batch.completedGoals
        .filter((completedGoal: CompletedGoal) => {
            // To obtain the date of the goal: batch-start-date + (goal day index - 1)
            const goalDate = batchStartDate;
            goalDate.setDate(goalDate.getDate() + (completedGoal.goalDay - 1));

            return sameDate(new Date(goalDate), today);
        }).map((completedGoal) => completedGoal.id);
}

function useMainDashboardContent(userId: number) {
    // In reality, there could be multiple Goals per day!!!

    const setError = useSetError();
    const [newNoteText, setNewNoteText] = useState("");

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [daysSinceStart, setDaysSinceStart] = useState<number>();
    const [todayCompletedGoals, setTodayCompletedGoals] = useState<number[]>();
    const [todayNotes, setTodayNotes] = useState<UserNote[]>();
    const [todayGoals, setTodayGoals] = useState<DayGoals>();
    const [batchToDisplay, setBatchToDisplay] = useState<Batch | undefined>(undefined);

    const [loadingGoalsAndNotes, setLoadingGoalsAndNotes] = useState(false);

    // Sparks a getUserInfo API call
    useEffect(() => {
        fetchUserInfo();
    }, []); // Executed only once

    useEffect(() => {
        async function processUserInfo(userInfo: UserInfo) {
            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0];
            setBatchToDisplay(batchToDisplay);
            const batchStartDate = new Date(batchToDisplay.startDate * 1000); // Feel free to change for testing
            //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...

            const level = batchToDisplay.level;
            let goals: DayGoals[];
            switch (level) {
                case 1 :
                    goals = Level1.level1Goals(batchStartDate);
                    break;
                case 2 :
                    goals = Level2.level2Goals(batchStartDate);
                    break;
                case 3 :
                    goals = Level3.level3Goals(batchStartDate);
                    break;
                default :
                    return Promise.reject("TODO: error handling");
            }

            // Should never be undefined!
            // TODO: handle error when undefined later
            const todayGoalsAux: DayGoals | undefined = getTodayGoals(goals);
            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes);
            const todaysCompletedGoals: number[] = getTodayCompletedGoals(batchToDisplay);

            setTodayGoals(todayGoalsAux);
            setTodayCompletedGoals(todaysCompletedGoals);
            setTodayNotes(todaysNotes);
        }

        // Calculate and set todayGoals, todaysCompletedGoals and todaysNotes
        if (userInfo != undefined)
            processUserInfo(userInfo);

    }, [userInfo]);

    async function fetchUserInfo() {
        setLoadingGoalsAndNotes(true);

        // TODO: in future, request only today's goals
        const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi(userId);
        //console.log('User Info: ', userInfo)

        setLoadingGoalsAndNotes(false);

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

    async function onMarkCompleteClickHandler(goal: Goal, batch: Batch) {
        const today = new Date();
        const startDate = new Date(batch.startDate * 1000);
        //const startDate = new Date(2024, 7, 21, 12) // For testing...
        const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const goalIndex = elapsedDays + 1;

        await service.markGoalAsCompleted(userId, batch.id, goal.id, goalIndex)
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
        todayGoals,
        todayCompletedGoals,
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

function MainContent({ userId }: { userId: number }) {
    const {
        userInfo,
        daysSinceStart,
        todayGoals,
        todayCompletedGoals,
        todayNotes,
        newNoteText,
        batchToDisplay,
        setError,
        setNewNoteText,
        /*
        onAddNewNoteClickHandler,
        onConfirmNewNoteSubmitClickHandler,*/
        onMarkCompleteClickHandler
    } = useMainDashboardContent(userId);
    console.log(userInfo?.avatarFilename);
    if (userInfo && daysSinceStart && todayGoals && todayCompletedGoals && todayNotes && batchToDisplay) {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                <Goals
                    currentDayNumber={daysSinceStart}
                    goals={todayGoals.goals}
                    completedGoals={todayCompletedGoals}
                    onMarkComplete={(goal: Goal) => onMarkCompleteClickHandler(goal, batchToDisplay)} />
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
    const userId = useUserId();

    return (
        <div className={styles.challengeViewContainer}>
            {userId
                ? <>
                    <MainContent userId={userId} />
                    {/*<Button variant={"round"}
                            className={styles.logoutButton}
                            onClick={() => {
                                logOut();
                                navigate("/");
                            }}
                    >Log out</Button>*/}
                </>
                : <div className={styles.loadingTextContainer}>
                    <h1>Loading...</h1>
                </div>
            }
        </div>
    );
}