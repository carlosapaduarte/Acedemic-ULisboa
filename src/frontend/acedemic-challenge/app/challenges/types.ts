export type Challenge = {
    id: number,
    day: number,
    title: string,
    description: string,
    completionDate: Date | null
}

export type DayChallenges = {
    challenges: Challenge[],
    date: Date
}