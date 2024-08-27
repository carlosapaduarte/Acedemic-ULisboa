import { useSetError } from "~/components/error/ErrorContainer";
import React, { useEffect, useState } from "react";
import { GoalAndDate, service, UserInfo, UserNote } from "~/service/service";
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
    return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date), today));
}

function getTodayCompletedGoals(completedGoals: GoalAndDate[]): string[] {
    const today = new Date();
    return completedGoals
        .filter((completedGoal: GoalAndDate) => sameDate(new Date(completedGoal.date), today))
        .map((v) => v.name);
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

    const [loadingGoalsAndNotes, setLoadingGoalsAndNotes] = useState(false);

    // Sparks a getUserInfo API call
    useEffect(() => {
        fetchUserInfo();
    }, []); // Executed only once

    useEffect(() => {
        async function processUserInfo(userInfo: UserInfo) {
            const fetchedStartDate = new Date(userInfo.startDate); // Feel free to change for testing

            let goals: DayGoals[];
            switch (userInfo.level) {
                case 1 :
                    goals = Level1.level1Goals(fetchedStartDate);
                    break;
                case 2 :
                    goals = Level2.level2Goals(fetchedStartDate);
                    break;
                case 3 :
                    goals = Level3.level3Goals(fetchedStartDate);
                    break;
                default :
                    return Promise.reject("TODO: error handling");
            }

            // Should never be undefined!
            // TODO: handle error when undefined later
            const todayGoalsAux: DayGoals | undefined = getTodayGoals(goals);
            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes);
            const todaysCompletedGoals: string[] = getTodayCompletedGoals(userInfo.completedGoals);

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

    async function onMarkCompleteClickHandler(goal: Goal) {
        await service.markGoalAsCompleted(userId, goal.title, new Date()) // TODO: handle error later
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
        if (userInfo && todayGoals && todayCompletedGoals && todayNotes)
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
                           onMarkComplete={onMarkCompleteClickHandler} />
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