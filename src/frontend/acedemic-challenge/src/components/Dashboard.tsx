import React, {useEffect, useReducer, useState} from "react";
import {useParams} from "react-router-dom";
import {Batch, CompletedGoal, GoalAndDate, service, UserInfo, UserNote} from '../service/service';
import {Level1} from "../challenges/level_1";
import {Level2} from "../challenges/level_2";
import {DayGoals, Goal} from "../challenges/types";
import {Level3} from "../challenges/level_3";
import {Logger} from "tslog";
import {Box, Button, TextField, Typography} from "@mui/material";
import {t} from "i18next";
import {useSetError} from "./error/ErrorContainer";

const logger = new Logger({name: "Dashboard"});

function DisplayUserNotes({notes}: { notes: UserNote[] }) {
    return (
        <Box>
            <Typography variant="h6" align="left">{t("dashboard:my_notes")}</Typography>
            <br/>
            {notes.map((note: UserNote) => {
                return (
                    <Box key={note.name}>
                        <Typography fontSize="110%" align="left" fontStyle='italic'>{note.name}</Typography>
                    </Box>
                )
            })}
        </Box>
    )
}

enum View {
    Default,
    CreateNewNote
}

function MainDashboardContent({userId}: { userId: number }) {
    // In reality, there could be multiple Goals per day!!!

    //const [state, dispatch] = useReducer(reducer, {type: 'challengesNotLoaded'})
    const setError = useSetError()
    const [newNoteText, setNewNoteText] = useState("");

    const [view, setView] = useState<View>(View.Default)

    const [userInfo, setUserInfo] = useState<UserInfo>()
    
    const [todayCompletedGoals, setTodayCompletedGoals] = useState<string[]>()
    const [todayNotes, setTodayNotes] = useState<UserNote[]>()
    const [todayGoals, setTodayGoals] = useState<DayGoals>()
    const [batchToDisplay, setBatchToDisplay] = useState<Batch | undefined>(undefined)

    const [loadingGoalsAndNotes, setLoadingGoalsAndNotes] = useState(false)

    // Sparks a getUserInfo API call
    useEffect(() => {
        fetchUserInfo()
    }, []) // Executed only once

    useEffect(() => {
        async function processUserInfo(userInfo: UserInfo) {
            function sameDate(date1: Date, date2: Date): boolean {
                return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()
            }
        
            function getTodayGoals(allGoals: DayGoals[]): DayGoals | undefined {
                const today = new Date()
                //console.log('All goals: ', allGoals)
                return allGoals.find((goalsForTheDay: DayGoals) => sameDate(goalsForTheDay.date, today))
            }
        
            function getTodayNotes(allNotes: UserNote[]): UserNote[] {
                const today = new Date()
                return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date * 1000), today))
            }
        
            function getTodayCompletedGoals(batch: Batch): string[] {
                const today = new Date()
                const batchStartDate = new Date(batch.startDate * 1000)
                //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...
                return batch.completedGoals
                    .filter((completedGoal: CompletedGoal) => {
                        
                        // To obtain the date of the goal: batch-start-date + (goal day index - 1)
                        const goalDate = batchStartDate
                        goalDate.setDate(goalDate.getDate() + (completedGoal.goalDay-1))
                        
                        return sameDate(new Date(goalDate), today)
                    }).map((v) => v.name)
            }

            // For debugging
            console.log('UserInfo: ', userInfo)

            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0]
            setBatchToDisplay(batchToDisplay)
            const batchStartDate = new Date(batchToDisplay.startDate * 1000) // Feel free to change for testing
            //const batchStartDate = new Date(2024, 7, 21, 12) // For testing...

            const level = batchToDisplay.level
            let goals: DayGoals[]
            switch (level) {
                case 1 :
                    goals = Level1.level1Goals(batchStartDate)
                    break
                case 2 :
                    goals = Level2.level2Goals(batchStartDate)
                    break
                case 3 :
                    goals = Level3.level3Goals(batchStartDate)
                    break
                default :
                    return Promise.reject('TODO: error handling')
            }

            console.log(goals)
        
            // Should never be undefined!
            // TODO: handle error when undefined later
            const todayGoalsAux: DayGoals | undefined = getTodayGoals(goals)
            //console.log(todayGoalsAux)
            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes)
            const todaysCompletedGoals: string[] = getTodayCompletedGoals(batchToDisplay)
            console.log(todayCompletedGoals)
            
            setTodayGoals(todayGoalsAux)
            setTodayCompletedGoals(todaysCompletedGoals)
            setTodayNotes(todaysNotes)
        }

        //console.log(userInfo)
        
        // Calculate and set todayGoals, todaysCompletedGoals and todaysNotes
        if (userInfo != undefined)
            processUserInfo(userInfo)

    }, [userInfo])

    async function fetchUserInfo() {
        setLoadingGoalsAndNotes(true)
    
        // TODO: in future, request only today's goals
        const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi(userId)
        //console.log('User Info: ', userInfo)
        
        setLoadingGoalsAndNotes(false)
    
        if (userInfo == undefined) {
            setError(new Error('User information could not be obtained!'))
            return
        }
        
        setUserInfo(userInfo)
    }

    function onAddNewNoteClickHandler() {
        setView(View.CreateNewNote)
    }

    async function onConfirmNewNoteSubmitClickHandler() {
        await service.createNewUserNote(userId, newNoteText, new Date())
            .then(() => {
                fetchUserInfo() // Updates state again
                setView(View.Default)
            }) // this triggers a new refresh. TODO: improve later)
            .catch((error) => setError(error))
    }

    async function onMarkCompleteClickHandler(goal: Goal, batch: Batch) {
        const today = new Date()
        const startDate = new Date(batch.startDate * 1000)
        //const startDate = new Date(2024, 7, 21, 12) // For testing...
        const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
        const goalIndex = elapsedDays + 1

        await service.markGoalAsCompleted(userId, batch.id, goal.title, goalIndex)
            .then(() => {
                fetchUserInfo() // Updates state again
            }) // this triggers a new refresh. TODO: improve later
            .catch((error) => setError(error))
    }

    //console.log(userInfo?.avatarFilename)

    if (view == View.Default) {
        if (userInfo && todayGoals && todayCompletedGoals && todayNotes && batchToDisplay)
            return (
                <Box>
                    <Box display='flex' justifyContent={'right'}>
                        <img
                            src={userInfo.avatarFilename}
                            height="100px"
                            loading="lazy"
                        />
                        <Button variant="contained" size="large" sx={{fontSize: "150%"}} onClick={onAddNewNoteClickHandler}>
                            {t("dashboard:add_note")}
                        </Button>
                    </Box>
                    <Goals goals={todayGoals.goals} completedGoals={todayCompletedGoals}
                           onMarkComplete={(goal: Goal) => onMarkCompleteClickHandler(goal, batchToDisplay)}/>
                    <DisplayUserNotes notes={todayNotes}/>
                </Box>
            )
        else
            return <></>
    } 
    else if (view == View.CreateNewNote)
        return (
            <Box display='flex' flexDirection='column'>
                <TextField
                    sx={{marginBottom: '2%', width: "60%"}}
                    id="outlined-controlled"
                    label="Note Description"
                    value={newNoteText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setNewNoteText(event.target.value)
                    }}
                />
                <Button variant="contained" sx={{width: '15%'}} onClick={onConfirmNewNoteSubmitClickHandler}>
                    {t("dashboard:confirm_new_note")}
                </Button>
            </Box>
        )
    else {
        setError(new Error('Something went wrong...'))
        return <></>
    }
}

function Goals({goals, completedGoals, onMarkComplete}: {
    goals: Goal[],
    completedGoals: string[],
    onMarkComplete: (goal: Goal) => void
}) {

    // Per goal, there is a "Mark Complete" button
    return (
        <Box>
            <Typography variant="h4" align="left" width="50%">{t("dashboard:current_challenge")}</Typography>
            <br/>
            {goals.map((goal: Goal) => {
                const completed = completedGoals.find((completedGoalName) => goal.title == completedGoalName)
                return (
                    <Box key={goal.title} display="flex" flexDirection="column" justifyContent="start">
                        <Box display="flex" flexDirection="row" alignItems='center'>
                            <Typography variant="h5" align="left" width="20%" marginBottom="1%">{goal.title}</Typography>
                            {
                                completed ? 
                                <Typography align="left" width="100%" marginBottom="1%" sx={{textDecoration: "underline"}}>
                                    ({t("dashboard:goal_completed")})
                                </Typography>
                                :
                                <></>
                            }
                            
                        </Box>
                        <Typography fontSize="110%" align="left" width="100%" marginBottom="1%">
                            {goal.description}
                        </Typography>
                        {
                            // Depends if goal is or not completed
                            completed ?
                                <></>
                                :
                                <Button variant="contained" sx={{width: "20%", marginBottom: "3%"}}
                                        onClick={() => onMarkComplete(goal)}>{t("dashboard:mark_complete")}
                                </Button>
                        }
                    </Box>
                )
            })}
        </Box>
    )
}

export default function Dashboard() {
    const {userId} = useParams<string>()

    /**
     * Determines initial quote to be displayed to user, based on current time of day.
     */
    function getHelloQuote(): string {
        const hourOfDay = new Date().getHours();
        switch (true) {
            case hourOfDay < 5:
                return t("hello_quote:night")
            case hourOfDay < 12:
                return t("hello_quote:morning")
            case hourOfDay < 17:
                return t("hello_quote:afternoon")
            case hourOfDay < 20:
                return t("hello_quote:evening")
            default:
                return t("hello_quote:night")
        }
    }

    let helloQuote = getHelloQuote()

    // TODO: improve error handling if [userId] is not a Number

    return (
        <Box padding="3%">
            <Typography variant="h3" align="left" marginBottom="0.5%">{helloQuote}, {userId}</Typography>
            <Typography variant="h5" align="left">{t("dashboard:main_message")}</Typography>
            <br/>
            <MainDashboardContent userId={Number(userId)}/>
        </Box>
    );
}