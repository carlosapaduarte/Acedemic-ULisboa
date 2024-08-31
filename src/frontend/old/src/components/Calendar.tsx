import {Box, Typography} from '@mui/material'
import {DayGoals, Goal} from '../challenges/types'
import {service, UserInfo, UserNote} from '../service/service'
import React, {useEffect, useState} from 'react'
import {Logger} from 'tslog'
import {useParams} from 'react-router-dom'
import {useSetError} from './error/ErrorContainer'
import LoadingSpinner from "./LoadingSpinner";
import {t} from "i18next";
<<<<<<<< HEAD:src/frontend/old/src/components/Calendar.tsx
import {CalendarDay, MyCalendar} from './MyCalendar'
import {utils} from '../utils'
import {DisplayUserNotes} from "./Dashboard";
========
import { CalendarDay, MyCalendar } from './MyCalendar'
import { utils } from '../utils'
import { Console } from 'console'
>>>>>>>> main:src/frontend/acedemic-challenge/src/components/Calendar.tsx

const logger = new Logger({name: "Calendar"});

export default function Calendar() {
    const setError = useSetError()

    const {userId} = useParams<string>()
    const userIdAsNumber = Number(userId) // TODO: 'userIdStr' could be undefined

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [goals, setGoals] = useState<DayGoals[] | undefined>(undefined);
    const [userNotes, setUserNotes] = useState<UserNote[] | undefined>(undefined);
    const [loadingGoals, setLoadingGoals] = useState<boolean>(false)

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    async function fetchUserCurrentDayAndLoadGoals() {
        if (loadingGoals)
            return
        setLoadingGoals(true)

        // TODO: in future, request only today's goals
        try {
            const userInfo: UserInfo = await service.fetchUserInfoFromApi(userIdAsNumber)

            // For simplification, use the first one
            const batchToDisplay = userInfo.batches[0]
            const level = batchToDisplay.level
            const startDate = new Date(2024, 7, 10, 12, 22, 22, 22) 
            //const startDate = new Date(batchToDisplay.startDate * 1000) // Feel free to change for testing
            const userGoals = utils.getUserGoals(level, startDate)

            //console.log("User Goals: ", userGoals)

            setStartDate(startDate)
            setGoals(userGoals)
            setUserNotes(userInfo.userNotes)
            setLoadingGoals(false)
        } catch (error: any) {
            setError(error)
        }
    }

    useEffect(() => {
        fetchUserCurrentDayAndLoadGoals()
    }, []);

    // Builds an object to display events in FullCalendar
    function buildEvents(goals: DayGoals[], userGoals: UserNote[]): any {

        function buildDayEvents(date: Date, goals: Goal[]): FullCalendarEventsType[] {
            const month = date.getMonth() + 1 // TODO: For some reason, this is necessary
            const monthStr: String = month < 10 ? '0' + month : month.toString()
            const day = date.getDate()
            const dayStr: String = day < 10 ? '0' + day : day.toString()

            // Deals with event for today
            const fullCalendarEvents: FullCalendarEventsType[] = goals.map((challenge: Goal) => {
                return {
                    'title': challenge.title,
                    'date': `${date.getFullYear()}-${monthStr}-${dayStr}`
                }
            })

            return fullCalendarEvents
        }

        function buildEvents(): any {
            let fullCalendarEvents: FullCalendarEventsType[] = [] // starts empty

            // Deals with standard goals
            for (let u = 0; u < goals.length; u++) {
                const dayEvents = buildDayEvents(goals[u].date, goals[u].goals) // already return an array of FullCalendarEventsType
                fullCalendarEvents = fullCalendarEvents.concat(dayEvents)
            }

            // Deals with user-created goals
            for (let u = 0; u < userGoals.length; u++) {
                const userGoal = userGoals[u]
                const goalDate = new Date(userGoal.date)

                const userGoalFullCalendarEvent = buildDayEvents(goalDate, [{ // array with single Goal
                    title: userGoal.name,
                    description: 'no-description' // TODO: fix this later
                }])

                fullCalendarEvents = fullCalendarEvents.concat(userGoalFullCalendarEvent)
            }

            return fullCalendarEvents
        }

        const events: FullCalendarEventsType[] = buildEvents()
        //console.log(events)
        return events
    }

    const handleDateClick = (clickedDay: CalendarDay) => {
        setSelectedDate(clickedDay.date)

        // TODO: I don't see any reason for this anymore
        /*
        if (startDate != undefined && goals != undefined) {

            //calculate time difference  
            var time_difference = clickedDay.date.getTime() - startDate.getTime();  
            //calculate days difference by dividing total milliseconds in a day
            var daysDifference = time_difference / (1000 * 60 * 60 * 24);

            if (daysDifference >= 0 && daysDifference < goals.length) {
                setSelectedDate(clickedDay.date)
            }
        }
        */
    }

    const onConfirmNewNoteSubmitClickHandler = (noteText: string) => {
        service.createNewUserNote(userIdAsNumber, noteText, selectedDate) // TODO: handle error later
            .then(() => fetchUserCurrentDayAndLoadGoals()) // TODO: improve later
            .catch((error) => setError(error))
    }


    return goals == undefined || userNotes == undefined ?
        <LoadingSpinner text={`Loading Goals and Calendar... ${goals}, ${userNotes}`}></LoadingSpinner>
        :
        (
            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: {xs: "column", md: 'row'},
                alignItems: 'center',
                justifyContent: 'space-evenly'
            }}>
                <Box sx={{width: "45%"}}>
                    <MyCalendar onDayClickHandler={handleDateClick}/>
                </Box>
                <RightContent
                    goals={goals}
                    selectedDate={selectedDate}
                    userNotes={userNotes}
                    onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler}
                />
            </Box>
        )
}

function RightContent({goals, selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler}: {
    goals: DayGoals[],
    selectedDate: Date,
    userNotes: UserNote[]
    onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
}) {
    return (
        <Box sx={{
            width: {xs: '100%', md: '35%'},
            height: {xs: '35%', md: '100%'},
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
             justifyContent={"center"}>
            <SelectedDayGoalInfo goals={goals} selectedDay={selectedDate}/>
            <SelectedDayNotes selectedDate={selectedDate} userNotes={userNotes}
                              onConfirmNewNoteSubmitClickHandler={onConfirmNewNoteSubmitClickHandler}/>
        </Box>
    )
}

function SelectedDayGoalInfo({goals, selectedDay}: { goals: DayGoals[], selectedDay: Date }) {
    // TODO: only displaying one Goal!!! There could be more

    function getSelectedDayGoals(goals: DayGoals[]): Goal[] {
        const goalsToReturn: Goal[] = []

        const goalsForTheDay = goals.filter((goal: DayGoals) => {
            const date = goal.date
            return utils.sameDay(date, selectedDay)
        }).map((goal: DayGoals) => goal.goals)

        goalsForTheDay.forEach((goalsExterior: Goal[]) => goalsExterior.forEach((goal: Goal) => goalsToReturn.push(goal)))

        return goalsToReturn
    }

    const goalsToDisplay = getSelectedDayGoals(goals) // Filters today's goals

    //console.log(goalsToDisplay)

    if (goalsToDisplay.length != 0)
        // Showing a single goal, for now
        return (
<<<<<<<< HEAD:src/frontend/old/src/components/Calendar.tsx
            <Box marginBottom="3%" sx={{overflow: "hidden"}}>
                <Typography variant='h6'>
                    {goalsToDisplay[0].title}
                </Typography>
                <Typography>
                    {goalsToDisplay[0].description}
                </Typography>
========
            <Box>
                {goalsToDisplay.map((goal: Goal, index: number) => 
                    <Box key={index} marginBottom="3%">
                        <Typography variant='h6'>
                            {goal.title}
                        </Typography>
                        <Typography>
                            {goal.description}
                        </Typography>
                    </Box>
                )}
>>>>>>>> main:src/frontend/acedemic-challenge/src/components/Calendar.tsx
            </Box>
        )
    else
        return (
            <Box marginBottom="3%">
                <Typography variant='h6'>
                    {t("calendar:no_goals_title")}
                </Typography>
            </Box>
        )
}

function SelectedDayNotes({selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler}: {
                              selectedDate: Date,
                              userNotes: UserNote[]
                              onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
                          }
) {
    const [newNoteText, setNewNoteText] = useState("");

    // Filters today's notes
    const userNotesToDisplay: UserNote[] = userNotes.filter((note: UserNote) => utils.sameDay(new Date(note.date * 1000), selectedDate))

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // For now, this new goal will be associated to a challenge day, for simplification

        if (event.key === 'Enter') {
            onConfirmNewNoteSubmitClickHandler(newNoteText)
        }
    };

    function onNewNoteSubmitClickHandler() {
        onConfirmNewNoteSubmitClickHandler(newNoteText)
    }


    return (
        <Box sx={{width: "100%"}}>
            {/*<TextField
                sx={{marginBottom: '2%', width: "100%"}}
                id="outlined-controlled"
                label={t("calendar:new_note_label")}
                value={newNoteText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setNewNoteText(event.target.value)
                }}
                onKeyDown={handleKeyPress}
            />
            <Button variant="contained" sx={{width: '100%'}}
                    onClick={onNewNoteSubmitClickHandler}>
                {t("dashboard:confirm_new_note")}
            </Button>*/}

            <DisplayUserNotes notes={userNotesToDisplay} alignTitleLeft={false}/>
        </Box>
    )
}