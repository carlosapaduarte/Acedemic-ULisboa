import React, {useEffect, useReducer, useState} from "react";
import {useParams} from "react-router-dom";
import {service, UserNote, UserInfo, GoalAndDate} from '../service/service';
import {Level1} from "../challenges/level_1";
import {Level2} from "../challenges/level_2";
import {DayGoals, Goal} from "../challenges/types";
import {Level3} from "../challenges/level_3";
import {Logger} from "tslog";
import { Box, Button, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { ifError } from "assert";

const logger = new Logger({name: "Dashboard"});

function Dashboard() {
    // This component should later display a Calendar with the challenges...
    // For now, let's simplify and only display the current challenge!

    const {userId} = useParams<string>()

    /**
     * Determines initial quote to be displayed to user, based on current time of day.
     */
    function getHelloQuote(): string {
        const hourOfDay = new Date().getHours();
        switch (true) {
            case hourOfDay < 5:
                return 'Good Night'
            case hourOfDay < 12:
                return 'Good Morning'
            case hourOfDay < 17:
                return 'Good Afternoon'
            case hourOfDay < 20:
                return 'Good Evening'
            default:
                return 'Good Night'
        }
    }

    console.log('HEerre')

    let helloQuote = getHelloQuote()

    // TODO: improve error handling if [userId] is not a Number

    return (
        <Box>
            <h1>{helloQuote} {userId}</h1>
            <h2>Best way to break a habit is to drop it.</h2>
            <br/>
            <MainDashboardContent userId={Number(userId)}/>
        </Box>
    );
}

type State =
    {
        type: 'challengesNotLoaded'
    }
    |
    {
        type: "loading",
    }
    |
    {
        type: "error",
    }
    |
    {
        type: "todaysGoals",
        goals: DayGoals,
        notes: UserNote[],
        todayCompletedGoals: string[] // just the goal name
    }
    |
    {
        type: 'addNewUserNote'
    }
    |
    {
        type: 'submitNewNote'
    }
    |
    {
        type: 'submitGoalCompleted',
        goal: Goal
    }

type Action =
    {
        type: 'setChallengesNotLoaded'
    }
    |
    {
        type: 'setLoading'
    }
    |
    {
        type: "setError",
    }
    |
    {
        type: "setTodaysGoals",
        goals: DayGoals,
        notes: UserNote[],
        todaysCompletedGoals: string[]
    }
    |
    {
        type: 'setAddNewUserNote'
    }
    |
    {
        type: 'setSubmitNewNote'
    }
    |
    {
        type: 'setSubmitGoalCompleted',
        goal: Goal
    }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setChallengesNotLoaded': {
            return {type: 'challengesNotLoaded'}
        }
        case 'setLoading': {
            return {type: "loading"}
        }
        case "setError": {
            return {type: "error"}
        }
        case "setTodaysGoals": {
            return {type: "todaysGoals", goals: action.goals, notes: action.notes, todayCompletedGoals: action.todaysCompletedGoals}
        }
        case "setAddNewUserNote": {
            return {type: "addNewUserNote"}
        }
        case 'setSubmitNewNote': {
            return {type: 'submitNewNote'}
        }
        case 'setSubmitGoalCompleted': {
            return {type: 'submitGoalCompleted', goal: action.goal}
        }
    }
}

function MainDashboardContent({userId}: { userId: number }) {
    // In reality, there could be multiple Goals per day!!!

    const [state, dispatch] = useReducer(reducer, {type: 'challengesNotLoaded'})
    const [newNoteText, setNewNoteText] = useState("");

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadGoals() {

            function sameDate(date1: Date, date2: Date) {
                return date1.getFullYear == date2.getFullYear && date1.getMonth == date2.getMonth && date1.getDate && date2.getDate
            }

            function getTodayGoals(allGoals: DayGoals[]): DayGoals | undefined {
                const today = new Date()
                //console.log('All goals: ', allGoals)
                return allGoals.find((goalsForTheDay: DayGoals) => sameDate(goalsForTheDay.date, today))
            }

            function getTodayNotes(allNotes: UserNote[]): UserNote[] {
                const today = new Date()
                return allNotes.filter((userNote: UserNote) => sameDate(new Date(userNote.date), today))
            }

            function getTodayCompletedGoals(completedGoals: GoalAndDate[]): string[] {
                const today = new Date()
                return completedGoals
                    .filter((completedGoal: GoalAndDate) => sameDate(new Date(completedGoal.date), today))
                    .map((v) => v.name)
            }

            dispatch({type: 'setLoading'})

            // TODO: in future, request only today's goals
            const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi(userId)
            console.log('User Info: ', userInfo)

            if (userInfo == undefined) {
                dispatch({type: 'setError'})
                return
            }

            const startDate: Date = new Date(userInfo.startDate)

            let goals: DayGoals[]
            switch (userInfo.level) {
                case 1 :
                    goals = Level1.level1Goals(startDate)
                    break
                case 2 :
                    goals = Level2.level2Goals(startDate)
                    break
                case 3 :
                    goals = Level3.level3Goals(startDate)
                    break
                default :
                    return Promise.reject('TODO: error handling')
            }

            // Should never be undefined!
            // TODO: handle error when undefined later
            const todaysGoals: DayGoals = getTodayGoals(goals)!
            const todaysNotes: UserNote[] = getTodayNotes(userInfo.userNotes)
            const todaysCompletedGoals: string[] = getTodayCompletedGoals(userInfo.completedGoals)

            dispatch({
                type: 'setTodaysGoals',
                goals: todaysGoals,
                notes: todaysNotes,
                todaysCompletedGoals: todaysCompletedGoals
            })
        }

        async function submitNewNote() {
            const result = await service.createNewUserNote(userId, newNoteText, new Date()) // TODO: handle error later
            dispatch({type: 'setChallengesNotLoaded'}) // this triggers a new refresh. TODO: improve later
        }

        async function submitGoalCompleted(goal: Goal) {
            const result = await service.markGoalAsCompleted(userId, goal.title, new Date()) // TODO: handle error later
            //console.log('After Goal completed!')
            dispatch({type: 'setChallengesNotLoaded'}) // this triggers a new refresh. TODO: improve later
        }

        if (state.type == 'challengesNotLoaded')
            fetchUserCurrentDayAndLoadGoals()

        if (state.type == 'submitNewNote')
            submitNewNote()

        if (state.type == 'submitGoalCompleted')
            submitGoalCompleted(state.goal)
            

    }, [state])

    function onAddNewNoteClickHandler() {
        dispatch({type: 'setAddNewUserNote'})
    }

    function onConfirmNewNoteSubmitClickHandler() {
        dispatch({type: 'setSubmitNewNote'})
    }

    function onMarkCompleteClickHandler(goal: Goal) {
        dispatch({type: 'setSubmitGoalCompleted', goal: goal})
    }

    if (state.type == 'todaysGoals') {
        //console.log(state.goals)
        return (
            <Box>
                <Button variant="contained" onClick={onAddNewNoteClickHandler}>{t("dashboard:add_note")}</Button>
                <Goals goals={state.goals.goals} completedGoals={state.todayCompletedGoals} onMarkComplete={onMarkCompleteClickHandler} />
                <DisplayUserNotes notes={state.notes} />
            </Box>
        )
    }
    else if (state.type == 'addNewUserNote')
        return (
            <Box>
                <TextField
                    id="outlined-controlled"
                    label="Controlled"
                    value={newNoteText}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setNewNoteText(event.target.value)
                    }}
                />
                <Button variant="contained" onClick={onConfirmNewNoteSubmitClickHandler}>{t("dashboard:confirm_new_note")}</Button>
            </Box>
        )
    else
        // TODO: implement later
        return (
            <></>
        )
    
}

function Goals({goals, completedGoals, onMarkComplete}: { goals: Goal[], completedGoals: string[], onMarkComplete: (goal: Goal) => void }) {

    // Per goal, there is a "Mark Complete" button
    return (
        <Box>
            <Typography variant="h4">{t("dashboard:current_challenge")}</Typography>
            {goals.map((goal: Goal) => {
                return (
                    <Box key={goal.title}>
                        <Typography variant="h5">{goal.title}</Typography>
                        <Typography variant="h6">{goal.description}</Typography>
                        {
                            // Depends if goal is or not completed
                            completedGoals.find((completedGoalName) => goal.title == completedGoalName) ?
                                <></>
                                :
                                <Button variant="contained" onClick={() => onMarkComplete(goal)}>{t("dashboard:mark_complete")}</Button>
                        }
                    </Box>
                )
            })}
        </Box>
    )
}

function DisplayUserNotes({notes}: { notes: UserNote[] }) {
    return (
        <Box>
            <Typography variant="h4">{t("dashboard:my_notes")}</Typography>
            {notes.map((note: UserNote) => {
                return (
                    <Box>
                        <Typography variant="h5">{note.name}</Typography>
                    </Box>
                )
            })}
            
        </Box>
    )
}

export default Dashboard;