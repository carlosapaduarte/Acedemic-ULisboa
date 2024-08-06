import {DayGoals, Goal} from "./types"

function getDayGoals(goals: Goal[], startDate: Date): DayGoals[] {
    // Returns DayGoals[], accounting for the start day

    const today = new Date()
    //console.log(today)
    //console.log(startDate)
    const todaysGoal = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) // corresponds to [level1Aux] goal index
    //console.log('Todays Goal: ', todaysGoal)
    const goalsShortened: Goal[] = goals.slice(0, todaysGoal + 1)
    //console.log('Goals shortened: ', goalsShortened)

    const goalsToReturn = goalsShortened.map((goal, index) => {
        const goalDate = new Date()
        goalDate.setDate(today.getDate() - (todaysGoal - index))
        return {
            goals: [{title: goal.title, description: goal.description}],
            date: goalDate
        }
    })
    console.log('Goals to return: ', goalsToReturn)
    return goalsToReturn
}

export const commons = {
    getDayGoals
}