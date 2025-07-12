// LoginStreak5Badge.ts
// This badge is awarded for maintaining a login streak of 5 consecutive days.

// Update the import path below to the actual location of Badge and UserData
import { Badge, UserData } from "./Badge";

export class LoginStreak5Badge extends Badge {
    id = "login_streak_5";
    title = "5 dias seguidos!";
    description = "Mantiveste o ritmo por 5 dias consecutivos.";
    icon = "login.png";

    isEarned(user: UserData): boolean {
        return user.loginStreak >= 5;
    }
}
