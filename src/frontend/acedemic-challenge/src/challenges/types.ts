export type Goal = {
    title: string,
    description: string
}

export type DayGoals = {
    goals: Goal[],
    date: Date
}