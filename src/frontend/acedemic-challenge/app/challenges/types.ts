export type Challenge = {
    id: number,
    title: string,
    description: string,
    completionDate: Date | null
}

export type BatchDay = {
    id: number,
    challenges: Challenge[],
    notes: string,
    date: Date
}