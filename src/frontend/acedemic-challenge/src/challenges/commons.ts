import {DayGoals, Goal} from "./types"

function getDayGoals(goals: Goal[], startDate: Date, level: number): DayGoals[] {
    // Returns DayGoals[], accounting for the start day

    const today = new Date()
    //console.log(today)
    //console.log(startDate)
    const elapsedDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) // corresponds to [level1Aux] goal index
    
    if (level == 1 || level == 2) {
        const goalsShortened: Goal[] = goals.slice(0, elapsedDays + 1)
        //console.log('Goals shortened: ', goalsShortened)

        const goalsToReturn = goalsShortened.map((goal, index) => {
            const goalDate = new Date()
            goalDate.setDate(today.getDate() - (elapsedDays - index))
            return {
                goals: [{title: goal.title, description: goal.description}],
                date: goalDate
            }
        })
        
        //console.log('Goals to return: ', goalsToReturn)
        return goalsToReturn
    } else {
        const goalsToReturn: DayGoals[] = []
        
        for (let u = 0; u < 21; u++) {
            const curDate: Date = new Date() // Starts on the first day (batch was created)
            curDate.setDate(startDate.getDate() + u)
            
            const goalsForTheDay: Goal[] = []
            if (u < 5) {
                for (let i = u; i >= 0; i--) {
                    goalsForTheDay.push(goals[i])
                }
            } else {
                for (let i = 0; i < 5; i++) {
                    goalsForTheDay.push(goals[i])
                }
            }
            goalsToReturn.push({
                goals: goalsForTheDay,
                date: curDate
            })
        }
        console.log(goalsToReturn)
        return goalsToReturn
    }
}

export const commons = {
    getDayGoals
}