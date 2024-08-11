import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin, {DateClickArg} from "@fullcalendar/interaction" // needed for dayClick
import {Box, Button, TextField, Typography} from '@mui/material'
import {DayGoals, Goal} from '../challenges/types'
import {service, UserInfo, UserNote} from '../service/service'
import React, {useEffect, useState} from 'react'
import {Logger} from 'tslog'
import {useParams} from 'react-router-dom'
import {Level1} from '../challenges/level_1'
import {Level2} from '../challenges/level_2'
import {Level3} from '../challenges/level_3'
import {useSetError} from './error/ErrorContainer'
import LoadingSpinner from "./LoadingSpinner";
import {t} from "i18next";

const logger = new Logger({name: "Calendar"});

export default function Calendar() {
    const setError = useSetError()

    const {userId} = useParams<string>()
    const userIdAsNumber = Number(userId) // TODO: 'userIdStr' could be undefined

    const [newNoteText, setNewNoteText] = useState("");

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [storedGoals, setStoredGoals] = useState<DayGoals[] | undefined>(undefined);
    const [storedUserNotes, setStoredNotes] = useState<UserNote[] | undefined>(undefined);
    const [loadingGoals, setLoadingGoals] = useState<boolean>(false)

    const [selectedDay, setSelectedDay] = useState<number>(0);

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

            const fetchedStartDate = new Date(2024, 6, 22, 22, 22, 22, 22) //new Date(userInfo.startDate) // Feel free to change for testing
            setStartDate(fetchedStartDate)

            let calculatedGoals: DayGoals[]
            switch (userInfo.level) {
                case 1 :
                    calculatedGoals = Level1.level1Goals(fetchedStartDate)
                    break
                case 2 :
                    calculatedGoals = Level2.level2Goals(fetchedStartDate)
                    break
                case 3 :
                    calculatedGoals = Level3.level3Goals(fetchedStartDate)
                    break
                default :
                    return Promise.reject('TODO: handle this error')
            }

            setStoredGoals(calculatedGoals)
            setStoredNotes(userInfo.userNotes)

            setLoadingGoals(false)
        } catch (error: any) {
            setError(error)
        }
    }

    useEffect(() => {
        fetchUserCurrentDayAndLoadGoals()
    }, []);

    async function submitNewNote(date: Date) {
        service.createNewUserNote(userIdAsNumber, newNoteText, date) // TODO: handle error later
            .then(() => fetchUserCurrentDayAndLoadGoals()) // TODO: improve later
            .catch((error) => setError(error))
    }

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

    const handleDateClick = (arg: DateClickArg) => {
        logger.debug('User clicked on: ', arg.date.toDateString())

        if (startDate != undefined && storedGoals != undefined) {
            const day = arg.date.getDate() - startDate.getDate()
            if (arg.date.getMonth() == startDate.getMonth() && day >= 0 && day < storedGoals.length)
                setSelectedDay(day)
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // For now, this new goal will be associated to a challenge day, for simplification

        if (event.key === 'Enter') {
            onConfirmNewNoteSubmitClickHandler()
        }
    };

    const onConfirmNewNoteSubmitClickHandler = () => {
        let date = new Date()
        date.setDate(date.getDate() + selectedDay)
        submitNewNote(date)
    }


    return storedGoals == undefined || storedUserNotes == undefined ?
        <LoadingSpinner text={`Loading Goals and Calendar... ${storedGoals}, ${storedUserNotes}`}></LoadingSpinner>
        :
        (
            <Box width='100%' height='100%' display='flex' flexDirection={"row"} alignItems="center"
                 justifyContent="space-evenly">
                <Box width='45%'>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={buildEvents(storedGoals, storedUserNotes)}
                        dateClick={handleDateClick}
                    />
                </Box>
                <Box width='35%' height={"100%"}>
                    <Box height="50%" display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
                        <Typography variant='h6'>
                            {storedGoals[selectedDay].goals[0].title}
                        </Typography>
                        <Typography>
                            {storedGoals[selectedDay].goals[0].description}
                        </Typography>
                        <Box display='flex' flexDirection='column'>
                            <TextField
                                sx={{marginBottom: '2%', width: "100%"}}
                                id="outlined-controlled"
                                label="New Note"
                                value={newNoteText}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setNewNoteText(event.target.value)
                                }}
                                onKeyDown={handleKeyPress}
                            />
                            <Button variant="contained" sx={{width: '100%'}}
                                    onClick={onConfirmNewNoteSubmitClickHandler}>
                                {t("dashboard:confirm_new_note")}
                            </Button>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='h6'>
                            {t("dashboard:notes")}
                        </Typography>
                        <Box display='flex' flexDirection='column'>
                            {storedUserNotes.map((note: UserNote, index: number) => {
                                return (
                                    <Box key={index} sx={{border: '1px solid black', padding: '1%'}}>
                                        <Typography>
                                            {note.name}
                                        </Typography>
                                        <Typography>
                                            {note.date}
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
}