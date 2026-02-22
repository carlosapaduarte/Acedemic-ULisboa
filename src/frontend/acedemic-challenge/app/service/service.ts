import { LevelType } from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { doFetch, Request, toJsonBody } from "./fetch";
import { NotAuthorizedError } from "~/service/error";
import type { Badge } from "~/types/Badge";

export type LoginResult = {
    access_token: string;
    token_type: string;
    newly_awarded_badges: Badge[];
};
export interface AwardedBadgeHistoryItem {
    awarded_at: string;
    badge: Badge;
}
export type AuthErrorType =
    | "USERNAME_ALREADY_EXISTS"
    | "INVALID_USERNAME_OR_PASSWORD"
    | "INVALID_FORMAT"
    | "USER_CREATION_FAILED"
    | "LOGIN_FAILED";

type AuthErrorField = "username" | "password";

const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
    USERNAME_ALREADY_EXISTS: "Username already exists!",
    INVALID_USERNAME_OR_PASSWORD: "Invalid username or password!",
    INVALID_FORMAT: "Invalid format of username or password!",
    USER_CREATION_FAILED: "User creation was not possible!",
    LOGIN_FAILED: "Login failed!",
};

export class AuthError extends Error {
    type: AuthErrorType;
    field: AuthErrorField;

    constructor(type: AuthErrorType, field: AuthErrorField) {
        super(AUTH_ERROR_MESSAGES[type]);
        this.name = "AuthError";
        this.type = type;
        this.field = field;
    }
}

async function login(username: string, password: string) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const request = {
        path: "commons/token",
        method: "POST",
        body: formData,
    };

    const response: Response = await doFetch(request).catch((error) => {
        if (error instanceof NotAuthorizedError) {
            return Promise.reject(
                new AuthError("INVALID_USERNAME_OR_PASSWORD", "password"),
            );
        }
        return Promise.reject(new AuthError("LOGIN_FAILED", "password"));
    });

    if (response.ok) {
        const responseObject: LoginResult = await response.json();
        localStorage["jwt"] = responseObject.access_token;
        return responseObject;
    } else {
        if (response.status == 400)
            return Promise.reject(new AuthError("INVALID_FORMAT", "password"));
        else if (response.status == 401)
            return Promise.reject(
                new AuthError("INVALID_USERNAME_OR_PASSWORD", "password"),
            );
        return Promise.reject(new AuthError("LOGIN_FAILED", "password"));
    }
}

async function testTokenValidity() {
    const request = {
        path: "commons/test-token",
        method: "GET",
    };
    const response: Response = await doFetch(request);
    if (!response.ok) {
        return Promise.reject(new Error("Login failed!"));
    }
}

async function createUser(username: string, password: string) {
    const request = {
        path: "commons/create-user",
        method: "POST",
        body: toJsonBody({ username, password }),
    };
    const response: Response = await doFetch(request);

    if (!response.ok) {
        if (response.status == 409)
            return Promise.reject(
                new AuthError("USERNAME_ALREADY_EXISTS", "username"),
            );
        else if (response.status == 400)
            return Promise.reject(
                new AuthError("INVALID_USERNAME_OR_PASSWORD", "password"),
            );

        return Promise.reject(
            new AuthError("USER_CREATION_FAILED", "password"),
        );
    }
}

async function createBatch(
    level: LevelType,
    challengeIds: number[] | number[][],
) {
    const request = {
        path: `academic-challenge/users/me/batches`,
        method: "POST",
        body: toJsonBody({ level: level, challengeIds: challengeIds }),
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Level selection failed!"));
}

async function selectShareProgressState(shareProgress: boolean) {
    const request = {
        path: `commons/users/me/publish-state`,
        method: "PUT",
        body: toJsonBody({ shareProgress }),
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(
            new Error("Progress share preference selection failed!"),
        );
}

async function selectAvatar(avatarFilename: string) {
    const request = {
        path: `commons/users/me/avatar`,
        method: "PUT",
        body: toJsonBody({ avatarFilename }),
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(new Error("Avatar selection failed!"));
}

export type UserNote = {
    name: string;
    date: number;
};

export type StoredChallenge = {
    id: number;
    completionDate: number | null;
    user_answer?: string | null;
};

export type StoredBatchDay = {
    id: number;
    challenges: StoredChallenge[];
    notes: string;
    user_answer?: string | null;
};

export type Batch = {
    id: number;
    startDate: number;
    level: number;
    batchDays: StoredBatchDay[];
};

// User info
export type UserInfo = {
    id: number;
    username: string;
    shareProgress: boolean;
    avatarFilename: string;
    batches: Batch[];
    currentChallengeLevel: number | null; //1, 2, 3 or null if no level selected
    tutorial_progress?: string[];
};

async function fetchBadgeHistory(): Promise<AwardedBadgeHistoryItem[]> {
    const request = {
        path: `gamification/badges/me/history`,
        method: "GET",
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        return await response.json();
    } else {
        return Promise.reject(
            new Error("Badge history could not be obtained!"),
        );
    }
}

async function fetchUserInfoFromApi(): Promise<UserInfo> {
    const request = {
        path: `commons/users/me`,
        method: "GET",
    };
    const response: Response = await doFetch(request);

    if (response.ok) {
        const responseObject: UserInfo = await response.json();
        return responseObject;
    } else return Promise.reject(new Error("User info could not be obtained!"));
}

async function editDayNote(batchId: number, batchDayId: number, notes: string) {
    const request = {
        path: `academic-challenge/users/me/batches/${batchId}/${batchDayId}/notes`,
        method: "POST",
        body: toJsonBody({ notes }),
    };
    const response: Response = await doFetch(request);
    if (!response.ok) return Promise.reject(new Error("Failed to edit note!"));
}

async function markChallengeAsCompleted(
    batchId: number,
    batchDayId: number,
    challengeId: number,
    userAnswer: string | null,
) {
    const request = {
        path: `academic-challenge/users/me/batches/${batchId}/${batchDayId}/completed-challenges`,
        method: "POST",
        body: toJsonBody({ challengeId, user_answer: userAnswer }),
    };
    const response: Response = await doFetch(request);
    if (!response.ok)
        return Promise.reject(
            new Error("Failed to mark challenge as completed!"),
        );
    return response.json();
}

async function fetchGamificationProfile() {
    const request = {
        path: `gamification/profile/me?app_scope=academic_challenge`,
        method: "GET",
    };
    const response: Response = await doFetch(request);
    if (!response.ok) {
        return Promise.reject(
            new Error("Failed to fetch gamification profile!"),
        );
    }
    return response.json();
}

async function markTutorialAsSeen(tutorialKey: string) {
    const request: Request = {
        path: `commons/users/me/tutorial`,
        method: "PUT",
        body: toJsonBody({ tutorial_key: tutorialKey }),
    };

    const response = await doFetch(request);

    if (!response.ok) {
        console.error("Falha ao gravar progresso do tutorial");
    }
}

export const service = {
    login,
    testTokenValidity,
    createUser,
    createBatch,
    selectShareProgressState,
    selectAvatar,
    fetchUserInfoFromApi,
    fetchUserInfo: fetchUserInfoFromApi,
    editDayNote,
    markChallengeAsCompleted,
    fetchBadgeHistory,
    fetchGamificationProfile,
    markTutorialAsSeen,
};
