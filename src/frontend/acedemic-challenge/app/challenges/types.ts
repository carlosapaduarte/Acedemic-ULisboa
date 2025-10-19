export type Challenge = {
    id: number;
    title: string;
    description: string;
    completionDate: Date | null;
    user_answer?: string | null;
    reflection_prompt?: string | null;
};

export type BatchDay = {
    level: number;
    id: number;
    challenges: Challenge[];
    notes: string;
    date: Date;
};
