import React, {useEffect, useState, useReducer} from "react";
import {useParams} from "react-router-dom";
import {CurrentUserDayAndLevel, Service} from '../service/service';
import { Level1 } from "../challenges/level_1";
import { Level2 } from "../challenges/level_2";
import { Challenge, Challenges } from "../challenges/types";
import { Level3 } from "../challenges/level_3";

function Dashboard() {
    // This component should later display a Calendar with the challenges...
    // For now, let's simplify and only display the current challenge!

    const { userId } = useParams<string>()

    // Determines initial quote to be displayed to user!
    const hourOfDay = new Date().getHours();
    let helloQuote = ''
    switch(true) {
        case hourOfDay < 12:
            helloQuote = 'Good Morning'
            break
        case hourOfDay < 17:
            helloQuote = 'Good Afternoon'
            break
        case hourOfDay < 20:
            helloQuote = 'Good Evening'
            break
        case hourOfDay < 5:
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

function Calendar({userId} : {userId: number}) {
    // Show challenges/goals and button to add new goal

    // TODO: improve this later by merging both states under into a reducer
    // For instance, have states representing the loading process
    const [userChallenges, setUserChallenges] = useState<Challenges | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadChallenge() {
            const currentUserDayAndLevel: CurrentUserDayAndLevel | undefined = await Service.fetchCurrentUserDayAndLevelFromAPi(userId)

            if (currentUserDayAndLevel == undefined) {
                setError('Could not retreive user information!')
                return
            }

            let challenges: Challenges
                switch(currentUserDayAndLevel.level) {
                    case 1 : challenges = Level1.level1
                    break
                    case 2 : challenges = Level2.level2
                    break
                    case 3 : challenges = Level3.level3
                    break
                    default : return Promise.reject('TODO: error handling')
                }
                

                if (currentUserDayAndLevel.level == 1 || currentUserDayAndLevel.level == 2) {
                    const todaysChallenge: Challenge = challenges.challenges[currentUserDayAndLevel.day - 1] // remember: indexes start at 0
                    // Just a single challenge for the day
                    setUserChallenges({challenges: [todaysChallenge]})
                } else { // level 3
                    if (currentUserDayAndLevel.day >= 5)
                        setUserChallenges({challenges: challenges.challenges})
                    
                    else {
                        // I think this necessary, not to remove challenges from [challenges.challenges]
                        // Starts of with all level-3 challenges
                        const todaysChallenges = [...challenges.challenges]

                        console.log(currentUserDayAndLevel.day)
                        console.log(todaysChallenges)
                        
                        // Removes necessary challenges
                        for (let u = currentUserDayAndLevel.day; u < 5; u++) {
                            console.log("here")
                            todaysChallenges.pop()
                        }
                        setUserChallenges({challenges: todaysChallenges})
                    }
                }
        }

        fetchUserCurrentDayAndLoadChallenge()
    }, [])

    if (error == undefined)
        // This '?' is only needed because state management is not yet optimized
        return (
            <div>
                <h1>This will soon be the Calendar...</h1>
                <br/>
                {userChallenges?.challenges.map((challenge, challengeNumber) => {
                    return (
                        <div key={challengeNumber}>
                            <h2>Challenge For Today: {challenge.title}</h2> 
                            <h3>{challenge.description}</h3>
                            <br/>
                        </div>
                    )
                })}
            </div>
        )
    else
        return (
            <div>
                <h1>This will soon be the Calendar...</h1>
                <h2>Error Loading Challenge For Today: {error}</h2>
            </div>
        )
}

export default Dashboard;