import { useEffect, useState } from "react";

export function useBadges() {
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        fetch("/api/badges") // em vez de /users/me
            .then((res) => res.json())
            .then(setBadges)
            .catch(console.error);
    }, []);

    return badges;
}
