export interface League {
    id: number;
    code: string;
    name: string; // Ex: "Liga Bronze", "Liga Prata", "Liga Ouro"
    description?: string;
    rank: number; // 1 para Bronze, 2 para Prata, etc
    badge_icon_url?: string;
    promotion_criteria_json?: Record<string, any>;
    rewards_json?: Record<string, any>;
}

export interface Badge {
    id: number;
    code: string;
    title: string;
    description: string;
    icon_url?: string;
    app_scope: string;
    is_active: boolean;
    criteria_json?: Record<string, any>;
    //opcionais porque uma medalha pode não ter uma liga associada
    league_id?: number;
    league?: League;
}

export type UserData = {
    id: number;
    username: string;
    loginStreak: number;
    joinDate: string;
    completedChallenges: string[];
};

export interface CombinedBadgeStatus extends Badge {
    has_earned: boolean;
    metadata_json?: {
        awarded_context?: string;
        event_timestamp_utc: string;
        [key: string]: any;
    };
}
