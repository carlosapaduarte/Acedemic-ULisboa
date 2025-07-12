import { allBadges } from "~/badges";
import { Badge } from "~/badges/Badge";
import { BadgeList } from "~/components/BadgeList";

import React from "react";
// TODO: MOCK: depois ir buscar ao loader
const mockUser = {
    id: "1",
    username: "alexandra",
    loginStreak: 7,
    joinDate: "2025-07-01",
    completedChallenges: ["21-day"],
};

export default function BadgesPage() {
    const earned = allBadges.filter((b) => b.isEarned(mockUser));
    //<BadgeList />;
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Medalhas</h1>
            <BadgeList />
            <ul className="grid grid-cols-2 gap-4 mt-4">
                {allBadges.map((badge: Badge) => {
                    const unlocked = earned.includes(badge);
                    return (
                        <li
                            key={badge.id}
                            className="border p-4 rounded shadow"
                        >
                            <img
                                src={`./assets/badges/${badge.icon}`}
                                alt={badge.title}
                                className="w-8 h-10 mb-2"
                            />
                            <h2 className="font-semibold">{badge.title}</h2>
                            <p className="text-sm opacity-80">
                                {badge.description}
                            </p>
                            <p className="text-xs mt-1">
                                {unlocked ? "✅ Conquistada" : "🔒 Bloqueada"}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
