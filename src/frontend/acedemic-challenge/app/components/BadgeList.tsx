import { useBadges } from "../hooks/useBadges";

type Badge = {
    id: number;
    code: string;
    title: string;
    description: string;
    icon_url?: string;
};

export function BadgeList() {
    const badges = useBadges();

    return (
        <div className="grid grid-cols-2 gap-4">
            <h1 className="text-2xl font-bold mb-4">BADGELIST!!!</h1>
            {badges.map((b: Badge) => (
                <div key={b.id} className="rounded-xl shadow p-4">
                    <img src={b.icon_url} alt={b.title} className="w-12 h-12" />
                    <p className="font-bold">{b.title}</p>
                    <p className="text-sm">{b.description}</p>
                </div>
            ))}
        </div>
    );
}
