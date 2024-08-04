import React, {useEffect, useState, useReducer} from "react";
import {useParams} from "react-router-dom";
import {Service} from '../service/service';

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

    return (
        <div>
            <h1>{helloQuote} {userId}</h1>
            <h2>Best way to break a habit is to drop it.</h2>
            <br/>
            <Calendar userId={Number(userId)}/> // TODO: improve error handling if userId is not a Number
        </div>
    );
}

function Calendar({userId} : {userId: number}) {
    // Show challenges/goals and button to add new goal

    // TODO: improve this later by merging both states under into a reducer
    // For instance, have states representing the loading process
    const [userChallenge, setUserChallenge] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)

    // Sparks a getUserInfo API call
    useEffect(() => {
        async function fetchUserCurrentDayAndLoadChallenge() {
            const userCurrentDay: number | undefined = await Service.fetchCurrentUserDayFromAPi(userId)
            // TODO: load respective challenge from a file
            const currentUserChallenge = "TODO"
            setUserChallenge(currentUserChallenge)
        }

        fetchUserCurrentDayAndLoadChallenge()
    }, [])

    if (error == undefined)
        return (
            <div>
                <h1>This will soon be the Calendar...</h1>
                <h2>Challenge For Today: {userChallenge}</h2>
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