import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin, {DateClickArg} from "@fullcalendar/interaction" // needed for dayClick
import {Box, Typography} from '@mui/material'
import {DayGoals, Goal} from '../challenges/types'
import {service, UserInfo, UserNote} from '../service/service'
import {useEffect, useReducer, useState} from 'react'
import {Logger} from 'tslog'
import {useParams} from 'react-router-dom'
import {Level1} from '../challenges/level_1'
import {Level2} from '../challenges/level_2'
import {Level3} from '../challenges/level_3'
import {useSetError} from './error/ErrorContainer'

const logger = new Logger({name: "Calendar"});

type State =
    {
        type: "challengesNotLoaded",
    }
    |
    {
        type: "loading",
    }
    |
    {
        type: "goals",
        goals: DayGoals[],
        userNotes: UserNote[]
    }
    |
    {
        type: 'addNewUserNote',
        date: Date
    }
    |
    {
        type: 'submitNewUserNote',
        date: Date
    }

type Action =
    {
        type: "setChallengesNotLoaded",
    }
    |
    {
        type: "setLoading",
    }
    |
    {
        type: "setGoals",
        goals: DayGoals[],
        userNotes: UserNote[]
    }
    |
    {
        type: 'setAddNewUserNote',
        date: Date
    }
    |
    {
        type: 'setSubmitNewNote',
        date: Date
    }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setChallengesNotLoaded': {
            return {type: 'challengesNotLoaded'}
        }
        case "setLoading": {
            return {type: "loading"}
        }
        case "setGoals": {
            return {type: "goals", goals: action.goals, userNotes: action.userNotes}
        }
        case 'setAddNewUserNote': {
            return {type: "addNewUserNote", date: action.date}
        }
        case "setSubmitNewNote": {
            return {type: 'submitNewUserNote', date: action.date}
        }
    }
}

export default function Calendar() {
    const setError = useSetError()

    const {userId} = useParams<string>()
    const userIdAsNumber = Number(userId) // TODO: 'userIdStr' could be undefined

    const [state, dispatch] = useReducer(reducer, {type: 'challengesNotLoaded'})
    const [newNoteText, setNewNoteText] = useState("");

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [storedGoals, setStoredGoals] = useState<DayGoals[]>([]);

    const [selectedDay, setSelectedDay] = useState<number>(0);

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    //console.log('State: ', state)

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadGoals() {
            dispatch({type: 'setLoading'})

            // TODO: in future, request only today's goals
            try {
                const userInfo: UserInfo = await service.fetchUserInfoFromApi(userIdAsNumber)

                const fetchedStartDate = new Date(2024, 7, 5, 22, 22, 22, 22) //new Date(userInfo.startDate) // Feel free to change for testing
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

                dispatch({
                    type: 'setGoals',
                    goals: calculatedGoals,
                    userNotes: userInfo.userNotes
                })
            } catch (error: any) {
                setError(error)
            }
        }

        async function submitNewNote(date: Date) {
            service.createNewUserNote(userIdAsNumber, newNoteText, date) // TODO: handle error later
                .then(() => dispatch({type: 'setChallengesNotLoaded'})) // this triggers a new refresh. TODO: improve later
                .catch((error) => setError(error))
        }

        if (state.type == 'challengesNotLoaded')
            fetchUserCurrentDayAndLoadGoals()

        if (state.type == 'submitNewUserNote')
            submitNewNote(state.date)

    }, [state])

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

        if (startDate != undefined) {
            const day = arg.date.getDate() - startDate.getDate()
            if (arg.date.getMonth() == startDate.getMonth() && day >= 0 && day < storedGoals.length)
                setSelectedDay(day)
        }

        //dispatch({type: 'setAddNewUserNote', date: arg.date})
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // For now, this new goal will be associated to a challenge day, for simplification

        if (state.type !== 'addNewUserNote')
            throw new Error('Should be in addNewGoal state!')

        if (event.key === 'Enter')
            dispatch({type: 'setSubmitNewNote', date: state.date})
    };


    if (state.type == 'goals')
        return (
            <Box width='100%' height='100%' display='flex' alignItems="center" justifyContent="center">
                <Box width='50%'>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={buildEvents(state.goals, state.userNotes)}
                        dateClick={handleDateClick}
                    />
                </Box>
                <Box width='50%'>
                    <Typography variant='h6'>
                        {storedGoals[selectedDay].goals[0].title}
                    </Typography>
                    <Typography>
                        {storedGoals[selectedDay].goals[0].description}
                    </Typography>
                </Box>
            </Box>
        )
    else if (state.type == 'addNewUserNote')
        return (
            <input
                type="text"
                placeholder="New Note"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={handleKeyPress}
            />
        )
    else
        // TODO: implement later
        return (
            <></>
        )
}