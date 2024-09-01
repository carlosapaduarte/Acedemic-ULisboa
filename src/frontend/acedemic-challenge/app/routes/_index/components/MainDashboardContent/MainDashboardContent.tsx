import { useSetError } from "~/components/error/ErrorContainer";
import React, { useEffect, useState } from "react";
import { Batch, CompletedGoal, service, UserInfo, UserNote } from "~/service/service";
import { DayGoals, Goal } from "~/challenges/types";
import { Level1 } from "~/challenges/level_1";
import { Level2 } from "~/challenges/level_2";
import { Level3 } from "~/challenges/level_3";
import { Button } from "~/components/Button";
import { t } from "i18next";
import DisplayUserNotes from "~/routes/_index/components/DisplayUserNotes/DisplayUserNotes";
import Goals from "~/routes/_index/components/Goals/Goals";

enum View {
    Default,
    CreateNewNote
}

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

function getTodayCompletedGoals(batch: Batch): string[] {
    const today = new Date();
    const batchStartDate = new Date(batch.startDate * 1000);
    //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...
    return batch.completedGoals
        .filter((completedGoal: CompletedGoal) => {

            // To obtain the date of the goal: batch-start-date + (goal day index - 1)
            const goalDate = batchStartDate;
            goalDate.setDate(goalDate.getDate() + (completedGoal.goalDay - 1));

            return sameDate(new Date(goalDate), today);
        }).map((v) => v.name);
}

function useMainDashboardContent(userId: number) {
    // In reality, there could be multiple Goals per day!!!

    //const [state, dispatch] = useReducer(reducer, {type: 'challengesNotLoaded'})
    const setError = useSetError();
    const [newNoteText, setNewNoteText] = useState("");

    const [view, setView] = useState<View>(View.Default);

    const [userInfo, setUserInfo] = useState<UserInfo>();

    const [todayCompletedGoals, setTodayCompletedGoals] = useState<string[]>();
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
            const todaysCompletedGoals: string[] = getTodayCompletedGoals(batchToDisplay);

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

    function onAddNewNoteClickHandler() {
        setView(View.CreateNewNote);
    }

    async function onConfirmNewNoteSubmitClickHandler() {
        await service.createNewUserNote(userId, newNoteText, new Date())
            .then(() => {
                fetchUserInfo(); // Updates state again
                setView(View.Default);
            }) // this triggers a new refresh. TODO: improve later)
            .catch((error) => setError(error));
    }

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

    return {
        userInfo,
        todayGoals,
        todayCompletedGoals,
        todayNotes,
        newNoteText,
        batchToDisplay,
        view,
        setError,
        setNewNoteText,
        setView,
        onAddNewNoteClickHandler,
        onConfirmNewNoteSubmitClickHandler,
        onMarkCompleteClickHandler
    };
}

export default function MainDashboardContent({ userId }: { userId: number }) {
    const {
        userInfo,
        todayGoals,
        todayCompletedGoals,
        todayNotes,
        newNoteText,
        batchToDisplay,
        view,
        setError,
        setNewNoteText,
        setView,
        onAddNewNoteClickHandler,
        onConfirmNewNoteSubmitClickHandler,
        onMarkCompleteClickHandler
    } = useMainDashboardContent(userId);
    console.log(userInfo?.avatarFilename);

    if (view == View.Default) {
        if (userInfo && todayGoals && todayCompletedGoals && todayNotes && batchToDisplay)
            return (
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "right" }}>
                        <img
                            src={"./test.webp"/*`./${userInfo.avatarFilename}`*/}
                            height="100px"
                            loading="lazy"
                            alt={"User's Avatar"} />
                        <Button variant="round" style={{ fontSize: "150%" }}
                                onClick={onAddNewNoteClickHandler}>
                            {t("dashboard:add_note")}
                        </Button>
                    </div>
                    <Goals goals={todayGoals.goals} completedGoals={todayCompletedGoals}
                           onMarkComplete={(goal: Goal) => onMarkCompleteClickHandler(goal, batchToDisplay)} />
                    <div style={{ flexGrow: 1 }}>
                        <DisplayUserNotes notes={todayNotes} alignTitleLeft={true} />
                    </div>
                </div>
            );
        else
            return <></>;
    } else if (view == View.CreateNewNote)
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                {/*<TextField
                    sx={{ marginBottom: "2%", width: "60%" }}
                    id="outlined-controlled"
                    label="Note Description"
                    value={newNoteText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setNewNoteText(event.target.value);
                    }}
                />*/}
                <Button variant="round" style={{ width: "15%" }} onClick={onConfirmNewNoteSubmitClickHandler}>
                    {t("dashboard:confirm_new_note")}
                </Button>
            </div>
        );
    else {
        setError(new Error("Something went wrong..."));
        return <></>;
    }
}