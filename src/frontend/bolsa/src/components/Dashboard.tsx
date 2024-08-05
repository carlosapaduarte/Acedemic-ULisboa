import React, {useEffect, useState, useReducer} from "react";
import {useParams} from "react-router-dom";
import {UserInfo, Service, UserGoal} from '../service/service';
import { Level1 } from "../challenges/level_1";
import { Level2 } from "../challenges/level_2";
import { Challenge, Challenges } from "../challenges/types";
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
        type : "challenges",
        todaysChallenges: Challenges,
        pastChallenges: Challenges,
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
        type : "setChallenges",
        todaysChallenge: Challenges,
        pastChallenges: Challenges,
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
        case "setChallenges": {
            return { type: "challenges", todaysChallenges: action.todaysChallenge, pastChallenges: action.pastChallenges, userGoals: action.userGoals }
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

            let challenges: Challenges
                switch(userInfo.level) {
                    case 1 : challenges = Level1.level1
                    break
                    case 2 : challenges = Level2.level2
                    break
                    case 3 : challenges = Level3.level3
                    break
                    default : return Promise.reject('TODO: error handling')
                }
                

                // Level 1/2
                if (userInfo.level == 1 || userInfo.level == 2) {
                    const todaysChallenge: Challenge = challenges.challenges[userInfo.currentDay - 1] // remember: indexes start at 0
                    
                    // Just a single challenge for the day
                    dispatch({
                        type: 'setChallenges', 
                        todaysChallenge: {challenges: [todaysChallenge]}, 
                        pastChallenges: {challenges: challenges.challenges.slice(0, userInfo.currentDay - 1)},
                        userGoals: userInfo.userGoals
                    })
                    
                } else { // level 3
                    if (userInfo.currentDay >= 5)
                        dispatch({
                            type: 'setChallenges', 
                            todaysChallenge: {challenges: challenges.challenges}, 
                            pastChallenges: {challenges: []}, // For simplification, no past challenges for level 3, for now
                            userGoals: userInfo.userGoals
                        })
                    
                    else {
                        // I think this necessary, not to remove challenges from [challenges.challenges]
                        // Starts of with all level-3 challenges
                        const todaysChallenges = [...challenges.challenges]

                        // Removes necessary challenges
                        for (let u = userInfo.currentDay; u < 5; u++) {
                            todaysChallenges.pop()
                        }
                        dispatch({
                            type: 'setChallenges', 
                            todaysChallenge: {challenges: todaysChallenges}, 
                            pastChallenges: {challenges: []}, // For simplification, no past challenges for level 3, for now
                            userGoals: userInfo.userGoals
                        })
                    }
                }
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
    function buildEvents(todaysChallenges: Challenge[], pastChallenges: Challenge[]): any { // I wish I could return here a "FullCalendarEventsType[]"
        const currentDate = new Date()

        function getEvents(date: Date, challenges: Challenge[]): any {
            const month = date.getMonth() + 1 // TODO: For some reason, this is necessary
            const monthStr: String = month < 10 ? '0' + month : month.toString()
            const day = date.getDate()
            const dayStr: String = day < 10 ? '0' + day : day.toString()

            // Deals with event for today
            const fullCalendarEvents: FullCalendarEventsType[] = challenges.map((challenge: Challenge) => {return {
                'title': challenge.title,
                'date': `${date.getFullYear()}-${monthStr}-${dayStr}`
            }})

            return fullCalendarEvents
        }
        
        function getPastEvents(): any {
            let pastEventsConcatenated: FullCalendarEventsType[] = [] // Each index will hold a past event for a specific day
            console.log(pastChallenges)

            // Iterates in reversed order
            for (let u = pastChallenges.length - 1; u >= 0; u--) {
                const daysToSubtract = pastChallenges.length - u
                const newDay = currentDate.getDate() - daysToSubtract // index 0 means: subtract 1 day
                const newDate = new Date()
                newDate.setDate(newDay)

                const fullCalendarEvent = getEvents(newDate, [pastChallenges[u]]) // should return a single event!

                pastEventsConcatenated = pastEventsConcatenated.concat(fullCalendarEvent)
            }

            // For now, assuming there is just one event for each past day
            return pastEventsConcatenated
        }

        const todaysEvents: FullCalendarEventsType[] = getEvents(currentDate, todaysChallenges)

        // Deals with past events (yesterday and before)
        const pastEvents = getPastEvents()
        
        const fullCalendarEvents: FullCalendarEventsType[] = todaysEvents.concat(pastEvents)
        console.log(fullCalendarEvents)
        return fullCalendarEvents
    }

    if (state.type == 'challenges')
        // This '?' is only needed because state management is not yet optimized

        return (
            <div>
                <FullCalendar
                    plugins={[ dayGridPlugin ]}
                    initialView="dayGridMonth"
                    events={buildEvents(state.todaysChallenges.challenges, state.pastChallenges.challenges)}
                />
                <br/>
                <h2>Challenges For Today:</h2> 
                {state.todaysChallenges.challenges.map((challenge, challengeNumber) => {
                    return (
                        <div key={challengeNumber}>
                            <h2>Title: {challenge.title}</h2> 
                            <h3>Description: {challenge.description}</h3>
                            <br/>
                        </div>
                    )
                })}

                <br/>
                <h2>Past Challenges:</h2> 
                {state.pastChallenges.challenges.map((challenge, challengeNumber) => {
                    return (
                        <div key={challengeNumber}>
                            <h2>Title: {challenge.title}</h2> 
                            <h3>Description: {challenge.description}</h3>
                            <br/>
                        </div>
                    )
                })}

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