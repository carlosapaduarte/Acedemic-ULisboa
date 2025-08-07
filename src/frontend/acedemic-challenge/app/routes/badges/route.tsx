// src\frontend\acedemic-challenge\app\routes\badges\route.tsx

import React, { useState, useEffect, useMemo } from "react";
import { CombinedBadgeStatus, League } from "~/types/badgeTypes"; // Importa League
import classNames from "classnames";
import styles from "./badgesPage.module.css";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const APP_BASE_PATH = import.meta.env.BASE_URL || "/";

export default function BadgesPage() {
    const [badges, setBadges] = useState<CombinedBadgeStatus[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem("jwt");

    useEffect(() => {
        const fetchBadgesData = async () => {
            if (!token) {
                setError(
                    "Utilizador não autenticado. Faça login para ver as medalhas.",
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await fetch(
                    `${API_BASE_URL}/gamification/badges/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        `Erro ao buscar medalhas: ${response.status} - ${errorData.detail || response.statusText}`,
                    );
                }

                const data: CombinedBadgeStatus[] = await response.json();
                setBadges(data);
            } catch (err: any) {
                console.error("Erro ao carregar dados das medalhas:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBadgesData();
    }, [token]);

    // Agrupamento e Ordenação por Liga
    const groupedAndSortedBadgesByLeague = useMemo(() => {
        const grouped = new Map<
            number,
            { league: League; badges: CombinedBadgeStatus[] }
        >();

        badges.forEach((badge) => {
            // Se a medalha não tiver uma liga associada, colocá-la num grupo "Sem Liga"
            if (!badge.league) {
                const noLeagueId = 9999; // ID arbitrário para "Sem Liga" (garante que fica no fim)
                const noLeague: League = {
                    id: noLeagueId,
                    name: "Medalhas Sem Liga Atribuída", // Nome mais descritivo
                    code: "NO_LEAGUE",
                    rank: noLeagueId, // Rank alto para ficar no fim
                };
                if (!grouped.has(noLeagueId)) {
                    grouped.set(noLeagueId, { league: noLeague, badges: [] });
                }
                grouped.get(noLeagueId)?.badges.push(badge);
                return;
            }

            const leagueId = badge.league.id;
            const leagueObj = badge.league; // Objeto League completo

            if (!grouped.has(leagueId)) {
                grouped.set(leagueId, { league: leagueObj, badges: [] });
            }
            grouped.get(leagueId)?.badges.push(badge);
        });

        // Converte o Map para um array de objetos { league, badges } e ordena pelo rank da liga
        // Isso garante que a Liga Bronze (rank 1) venha primeiro, depois Liga Prata (rank 2), etc.
        const sortedLeagues = Array.from(grouped.values()).sort(
            (a, b) => a.league.rank - b.league.rank,
        );

        return sortedLeagues;
    }, [badges]);

    if (loading) {
        return <p className="p-4 text-gray-300">A carregar medalhas...</p>;
    }

    if (error) {
        return <p className="p-4 text-red-400">Erro: {error}</p>;
    }

    return (
        <div className="p-4 min-h-screen bg-purple-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-50">
                Medalhas
            </h1>

            {groupedAndSortedBadgesByLeague.length === 0 &&
            !loading &&
            !error ? (
                <p className="text-center text-gray-400">
                    Não há medalhas para exibir.
                </p>
            ) : (
                groupedAndSortedBadgesByLeague.map(
                    ({ league, badges: leagueBadges }) => (
                        <div key={league.id} className="mb-8">
                            {/* Título da Liga */}
                            <h2 className="text-2xl font-bold mb-4 text-gray-100 border-b-2 border-gray-700 pb-2">
                                {league.name}
                            </h2>

                            {/* Informação sobre os critérios de passagem (Nota do utilizador) */}
                            <p className="text-sm text-gray-300 mb-4">
                                Para avançar para a próxima Liga, é necessário
                                cumprir 70% das medalhas **conquistadas** nesta
                                liga.
                            </p>
                            {/* Exemplo de barra de progresso para a liga */}
                            {leagueBadges.length > 0 && (
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${(leagueBadges.filter((b) => b.has_earned).length / leagueBadges.length) * 100}%`,
                                        }}
                                    ></div>
                                    <span className="text-sm text-gray-400 block text-right mt-1">
                                        {
                                            leagueBadges.filter(
                                                (b) => b.has_earned,
                                            ).length
                                        }{" "}
                                        / {leagueBadges.length} medalhas
                                        conquistadas
                                    </span>
                                </div>
                            )}

                            {/* Grid de Medalhas para esta liga */}
                            <ul className={styles.badgesGrid}>
                                {leagueBadges.map(
                                    (badge: CombinedBadgeStatus) => {
                                        const imageUrl = `${APP_BASE_PATH}${badge.icon_url?.startsWith("/") ? badge.icon_url.substring(1) : badge.icon_url}`;

                                        return (
                                            <li
                                                key={badge.id}
                                                className={classNames(
                                                    styles.badgeItem,
                                                    {
                                                        [styles.badgeEarned]:
                                                            badge.has_earned,
                                                        [styles.badgeLocked]:
                                                            !badge.has_earned,
                                                    },
                                                )}
                                            >
                                                <img
                                                    src={
                                                        imageUrl ||
                                                        `${APP_BASE_PATH}assets/default-badge.png`
                                                    }
                                                    alt={badge.title}
                                                    className={classNames(
                                                        styles.badgeImage,
                                                        {
                                                            [styles.badgeImageLocked]:
                                                                !badge.has_earned,
                                                        },
                                                    )}
                                                />

                                                <h2
                                                    className={classNames(
                                                        styles.badgeTitle,
                                                        {
                                                            [styles.badgeTitleEarned]:
                                                                badge.has_earned,
                                                            [styles.badgeTitleLocked]:
                                                                !badge.has_earned,
                                                        },
                                                    )}
                                                >
                                                    {badge.title}
                                                </h2>

                                                <p
                                                    className={classNames(
                                                        styles.badgeDescription,
                                                        {},
                                                    )}
                                                >
                                                    {badge.description}
                                                </p>

                                                <div
                                                    className={classNames(
                                                        styles.badgeStatusText,
                                                        {
                                                            [styles.badgeStatusEarned]:
                                                                badge.has_earned,
                                                            [styles.badgeStatusLocked]:
                                                                !badge.has_earned,
                                                        },
                                                    )}
                                                >
                                                    {badge.has_earned ? (
                                                        <>
                                                            <span
                                                                role="img"
                                                                aria-label="earned"
                                                                className="mr-1"
                                                            >
                                                                ✅
                                                            </span>{" "}
                                                            Conquistada
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={`${APP_BASE_PATH}icons/lock_icon.svg`}
                                                                alt="Bloqueado"
                                                                className={
                                                                    styles.lockIcon
                                                                }
                                                            />
                                                            Bloqueada
                                                        </>
                                                    )}
                                                </div>

                                                {badge.has_earned &&
                                                    badge.metadata_json &&
                                                    Object.keys(
                                                        badge.metadata_json,
                                                    ).length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-700 bg-green-200 p-1 rounded">
                                                            <p>
                                                                Contexto:{" "}
                                                                {badge
                                                                    .metadata_json
                                                                    .awarded_context ||
                                                                    "N/A"}
                                                            </p>
                                                            <p>
                                                                Quando:{" "}
                                                                {new Date(
                                                                    badge.metadata_json.event_timestamp_utc,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                            </li>
                                        );
                                    },
                                )}
                            </ul>
                        </div>
                    ),
                )
            )}
        </div>
    );
}
