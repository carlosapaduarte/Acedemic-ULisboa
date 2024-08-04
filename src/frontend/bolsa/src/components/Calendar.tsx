import {useParams} from "react-router-dom";

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
            <h1>${helloQuote} ${userId}</h1>
            <h2>Best way to break a habit is to drop it.</h2>
            <br/>
            <Calendar/>
        </div>
    );
}

function Calendar() {
    // Show challenges/goals and button to add new goal

    return (
        <h1>This will soon be the Calendar...</h1>
    )
}

export default Dashboard;