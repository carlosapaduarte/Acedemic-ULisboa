export type Challenge = {
    id: number,
    title: string,
    description: string
}

export type DayChallenges = {
    challenges: Challenge[],
    date: Date
}