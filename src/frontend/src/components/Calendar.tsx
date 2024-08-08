import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin, {DateClickArg} from "@fullcalendar/interaction" // needed for dayClick
import { Box } from '@mui/material'
import { DayGoals, Goal } from '../challenges/types'
import { service, UserInfo, UserNote } from '../service/service'
import { useEffect, useReducer, useState } from 'react'
import { Logger } from 'tslog'
import { useParams } from 'react-router-dom'
import { Level1 } from '../challenges/level_1'
import { Level2 } from '../challenges/level_2'
import { Level3 } from '../challenges/level_3'

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
        type: "error",
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
        type: "setError",
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
        case "setError": {
            return {type: "error"}
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
    const {userId} = useParams<string>()
    const userIdAsNumber = Number(userId) // TODO: 'userIdStr' could be undefined

    const [state, dispatch] = useReducer(reducer, {type: 'challengesNotLoaded'})
    const [newNoteText, setNewGoalName] = useState("");

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    console.log('State: ', state)

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadGoals() {
            dispatch({type: 'setLoading'})

            // TODO: in future, request only today's goals
            const userInfo: UserInfo | undefined = await service.fetchUserInfoFromApi(userIdAsNumber)

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
                    return Promise.reject('TODO: handle this error')
            }

            dispatch({
                type: 'setGoals',
                goals: goals,
                userNotes: userInfo.userNotes
            })
        }

        async function submitNewNote(date: Date) {
            const result = service.createNewUserNote(userIdAsNumber, newNoteText, date) // TODO: handle error later
            dispatch({type: 'setChallengesNotLoaded'}) // this triggers a new refresh. TODO: improve later
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
        dispatch({type: 'setAddNewUserNote', date: arg.date})
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
            <Box>
                <Box>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={buildEvents(state.goals, state.userNotes)}
                        dateClick={handleDateClick}
                    />
                </Box>
            </Box>
        )
    else if (state.type == 'addNewUserNote')
        return (
            <input
                type="text"
                placeholder="New Goal Name"
                value={newNoteText}
                onChange={(e) => setNewGoalName(e.target.value)}
                onKeyDown={handleKeyPress}
            />
        )
    else
        // TODO: implement later
        return (
            <></>
        )
}