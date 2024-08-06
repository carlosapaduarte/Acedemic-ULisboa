import React, {useEffect, useState, useReducer} from "react";
import {useParams} from "react-router-dom";
import {UserInfo, Service, UserGoal} from '../service/service';
import { Level1 } from "../challenges/level_1";
import { Level2 } from "../challenges/level_2";
import { Goal, DayGoals } from "../challenges/types";
import { Level3 } from "../challenges/level_3";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import { Console } from "console";

function Dashboard() {
    // This component should later display a Calendar with the challenges...
    // For now, let's simplify and only display the current challenge!

    const { userId } = useParams<string>()

    // Determines initial quote to be displayed to user!
    const hourOfDay = new Date().getHours();
    let helloQuote = ''
    switch(true) {
        case hourOfDay < 5:
            helloQuote = 'Good Night'
            break
        case hourOfDay < 12:
            helloQuote = 'Good Morning'
            break
        case hourOfDay < 17:
            helloQuote = 'Good Afternoon'
            break
        case hourOfDay < 20:
            helloQuote = 'Good Evening'
            break
        default:
            helloQuote = 'Good Night'
    }

    // TODO: improve error handling if [userId] is not a Number

    return (
        <div>
            <h1>{helloQuote} {userId}</h1>
            <h2>Best way to break a habit is to drop it.</h2>
            <br/>
            <Calendar userId={Number(userId)}/>
        </div>
    );
}

type State =
    {
        type: "challengesNotLoaded",
    }
    |
    {
        type : "loading",
    }
    |
    {
        type : "error",
    }
    |
    {
        type : "goals",
        goals: DayGoals[],
        userGoals: UserGoal[]
    }
    |
    {
        type: 'addingNewUserGoal',
    }

type Action =
    {
        type: "setChallengesNotLoaded",
    }
    |
    {
        type : "setLoading",
    }
    |
    {
        type : "setError",
    }
    |
    {
        type : "setGoals",
        goals: DayGoals[],
        userGoals: UserGoal[]
    }
    |
    {
        type: 'setAddingNewUserGoal'
    }

function reducer(state: State, action: Action): State {
    switch(action.type) {
        case 'setChallengesNotLoaded': {
            return { type: 'challengesNotLoaded' }
        }
        case "setLoading": {
            return { type: "loading" }
        }
        case "setError": {
            return { type: "error" }
        }
        case "setGoals": {
            return { type: "goals", goals: action.goals, userGoals: action.userGoals }
        }
        case "setAddingNewUserGoal": {
            return { type: "addingNewUserGoal" }
        }   
    }
}

function Calendar({userId} : {userId: number}) {
    // Show challenges/goals and button to add new goal

    const [state, dispatch] = useReducer(reducer, {type : 'challengesNotLoaded'})
    const [newGoalName, setNewGoalName] = useState("");

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadChallenge() {
            dispatch({type: 'setLoading'})

            const userInfo: UserInfo | undefined = await Service.fetchUserInfoFromApi(userId)

            if (userInfo == undefined) {
                dispatch({type: 'setError'})
                return
            }

            const startDate: Date = new Date(userInfo.startDate)

            let goals: DayGoals[]
                switch(userInfo.level) {
                    case 1 : goals = Level1.level1Goals(startDate)
                    break
                    case 2 : goals = Level2.level2Goals(startDate)
                    break
                    case 3 : goals = Level3.level3Goals(startDate)
                    break
                    default : return Promise.reject('TODO: error handling')
                }

                dispatch({
                    type: 'setGoals', 
                    goals: goals, 
                    userGoals: userInfo.userGoals
                })
        }

        async function createNewUserGoal() {
            await Service.createNewUserGoal(userId, newGoalName)
            dispatch({ type: 'setChallengesNotLoaded' }) // TODO: not the best way but for now will do...
        }

        if (state.type == 'challengesNotLoaded')
            fetchUserCurrentDayAndLoadChallenge()

        else if (state.type == 'addingNewUserGoal')
            createNewUserGoal()

    }, [state])

    
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // For now, this new goal will be associated to a challenge day, for simplification
        if (event.key === 'Enter')
            dispatch({type: 'setAddingNewUserGoal'})
    };

    type FullCalendarEventsType = {
        title: String,
        date: String
    }

    // Builds an object to display events in FullCalendar
    function buildEvents(goals: DayGoals[]): any {

        function buildDayEvents(date: Date, goals: Goal[]): FullCalendarEventsType[] {
            const month = date.getMonth() + 1 // TODO: For some reason, this is necessary
            const monthStr: String = month < 10 ? '0' + month : month.toString()
            const day = date.getDate()
            const dayStr: String = day < 10 ? '0' + day : day.toString()

            // Deals with event for today
            const fullCalendarEvents: FullCalendarEventsType[] = goals.map((challenge: Goal) => { return {
                'title': challenge.title,
                'date': `${date.getFullYear()}-${monthStr}-${dayStr}`
            }})

            return fullCalendarEvents
        }

        function buildEvents(goals: DayGoals[]): any {
            let events: FullCalendarEventsType[] = [] // starts empty
            for (let u = 0; u < goals.length; u++) {
                const dayEvents = buildDayEvents(goals[u].date, goals[u].goals) // already return an array of FullCalendarEventsType
                events = events.concat(dayEvents)
            }
            return events
        }

        const events: FullCalendarEventsType[] = buildEvents(goals)
        console.log(events)
        return events        
    }

    if (state.type == 'goals')
        // This '?' is only needed because state management is not yet optimized

        return (
            <div>
                <FullCalendar
                    plugins={[ dayGridPlugin ]}
                    initialView="dayGridMonth"
                    events={buildEvents(state.goals)}
                />
                <br/>
                <h2>Created Goals:</h2> 
                {state.userGoals.map((goal, goalNumber) => {
                    return (
                        <div key={goalNumber}>
                            <h2>Goal Name: {goal.name}</h2> 
                            <h3>Day: {goal.day}</h3>
                            <br/>
                        </div>
                    )
                })}

                <input
                    type="text"
                    placeholder="New Goal Name"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
            </div>
        )
    else if (state.type == 'error')
        return (
            <div>
                <h2>Handle this error later!</h2>
            </div>
        )
    else if (state.type == 'loading')
        return (
            <div>
                <h2>Loading...</h2>
            </div>
        )
    else if (state.type == 'addingNewUserGoal')
        return (
            <div>
                <h2>Adding New Goal!</h2>
            </div>
        )
    else return (
        <h1>Should Not Arrive Here!</h1>
    )
}

export default Dashboard;