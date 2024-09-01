export type Goal = {
    id: number,
    title: string,
    description: string
}

export type DayGoals = {
    goals: Goal[],
    date: Date
}