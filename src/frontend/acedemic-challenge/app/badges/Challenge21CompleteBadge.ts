import { Badge, UserData } from "~/badges/Badge";

export class Challenge21CompleteBadge extends Badge {
    id = "challenge_21_complete";
    title = "Desafio 21 dias concluído! :)";
    description =
        "Terminaste o teu primeirp desafio completo de 21 dias. Parabéns!";
    icon = "challenge.png";

    isEarned(user: UserData): boolean {
        return user.completedChallenges.includes("21-day");
    }
}
// This badge is awarded for completing the 21-day challenge.
// It checks if the user has "21-day" in their completedChallenges array.
// The badge includes an ID, title, description, and icon.
// The icon file should be placed in the assets/badges directory as "challenge.png
