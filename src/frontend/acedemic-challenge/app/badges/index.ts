import { LoginStreak5Badge } from "./LoginStreak5Badge";
import { Challenge21CompleteBadge } from "./Challenge21CompleteBadge";
// eslint-disable-next-line import/no-unresolved
import { Badge } from "~/badges/Badge";

export const allBadges: Badge[] = [
    new LoginStreak5Badge(),
    new Challenge21CompleteBadge(),
];
export function getBadgeById(id: string): Badge | undefined {
    return allBadges.find((badge) => badge.id === id);
}
export function getBadgeByTitle(title: string): Badge | undefined {
    return allBadges.find((badge) => badge.title === title);
}
export function getBadgeByIcon(icon: string): Badge | undefined {
    return allBadges.find((badge) => badge.icon === icon);
}
export function getAllBadges(): Badge[] {
    return allBadges;
}
