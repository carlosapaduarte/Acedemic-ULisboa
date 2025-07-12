export type UserData = {
    id: string;
    username: string;
    loginStreak: number;
    joinDate: string; // ou Date
    completedChallenges: string[];
};

export abstract class Badge {
    abstract id: string;
    abstract title: string;
    abstract description: string;
    abstract icon: string;

    abstract isEarned(user: UserData): boolean;
}
