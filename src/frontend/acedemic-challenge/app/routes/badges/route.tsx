import React, { useState, useEffect, useMemo } from "react";
import type { CombinedBadgeStatus, League } from "~/types/Badge";
import classNames from "classnames";
import styles from "./badgesPage.module.css";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const APP_BASE_PATH = import.meta.env.BASE_URL || "/";

export async function loader({ request }: LoaderFunctionArgs) {
    console.log("--- EXECUTANDO O LOADER DA PÁGINA DE MEDALHAS ---");
    return json({ locale: "pt" });
}

export default function BadgesPage() {
    const [badges, setBadges] = useState<CombinedBadgeStatus[]>([]);
    const [currentUserLevelRank, setCurrentUserLevelRank] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");

        const fetchPageData = async () => {
            if (!token) {
                setError(
                    "Utilizador não autenticado. Faça login para ver as medalhas.",
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [badgesResponse, leagueResponse] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/gamification/badges/status?app_scope=academic_challenge`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    ),
                    fetch(`${API_BASE_URL}/gamification/leagues/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!badgesResponse.ok || !leagueResponse.ok) {
                    let errorDetail = "Ocorreu um erro no servidor.";
                    // Tenta obter a mensagem de erro detalhada do backend
                    if (!badgesResponse.ok) {
                        try {
                            const errorJson = await badgesResponse.json();
                            errorDetail = `Erro ao buscar medalhas: ${errorJson.detail || badgesResponse.statusText}`;
                        } catch {
                            errorDetail = `Erro ao buscar medalhas: ${badgesResponse.statusText}`;
                        }
                    } else if (!leagueResponse.ok) {
                        try {
                            const errorJson = await leagueResponse.json();
                            errorDetail = `Erro ao buscar liga: ${errorJson.detail || leagueResponse.statusText}`;
                        } catch {
                            errorDetail = `Erro ao buscar liga: ${leagueResponse.statusText}`;
                        }
                    }
                    throw new Error(errorDetail);
                }

                // Se ambas as respostas estiverem OK, processa os dados
                const badgesData: CombinedBadgeStatus[] =
                    await badgesResponse.json();
                setBadges(badgesData);

                const leagueData = await leagueResponse.json();
                if (leagueData && leagueData.league) {
                    setCurrentUserLevelRank(leagueData.league.rank);
                }
            } catch (err: any) {
                console.error(
                    "Erro ao carregar dados da página de medalhas:",
                    err,
                );
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    const groupedAndSortedBadgesByLevel = useMemo(() => {
        const grouped = new Map<
            number,
            { league: League; badges: CombinedBadgeStatus[] }
        >();
        badges.forEach((badge) => {
            if (badge.league) {
                const leagueId = badge.league.id;
                if (!grouped.has(leagueId)) {
                    grouped.set(leagueId, { league: badge.league, badges: [] });
                }
                grouped.get(leagueId)?.badges.push(badge);
            }
        });
        return Array.from(grouped.values()).sort(
            (a, b) => a.league.rank - b.league.rank,
        );
    }, [badges]);

    if (loading)
        return <p className="p-4 text-gray-300">A carregar medalhas...</p>;
    if (error) return <p className="p-4 text-red-400">Erro: {error}</p>;

    return (
        <div className="p-4 min-h-screen bg-purple-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-50">
                Medalhas
            </h1>

            {groupedAndSortedBadgesByLevel.length === 0 && !loading ? (
                <p className="text-center text-gray-400">
                    Não há medalhas para exibir.
                </p>
            ) : (
                groupedAndSortedBadgesByLevel.map(
                    ({ league, badges: levelBadges }) => {
                        const isLevelCompleted = levelBadges.every(
                            (b) => b.has_earned,
                        );
                        // O nível está bloqueado se o rank for superior ao do utilizador (exceto para o nível 0, que está sempre desbloqueado)
                        const isLevelLocked =
                            league.rank > currentUserLevelRank &&
                            league.rank !== 0;

                        return (
                            <div
                                key={league.id}
                                className={classNames(styles.levelContainer, {
                                    [styles.levelCompleted]: isLevelCompleted,
                                    [styles.levelLocked]: isLevelLocked,
                                })}
                            >
                                <h2 className={styles.levelHeader}>
                                    {league.name}
                                </h2>

                                <div className={styles.levelContent}>
                                    {isLevelLocked && (
                                        <div className={styles.lockedOverlay}>
                                            <div
                                                className={
                                                    styles.lockIconContainer
                                                }
                                            >
                                                <img
                                                    src={`${APP_BASE_PATH}icons/padlock.svg`}
                                                    //src\frontend\acedemic_challenge\public\icons\padlock.svg
                                                    alt="Nível Bloqueado"
                                                    className={
                                                        styles.lockIconSvg
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <ul className={styles.badgesGrid}>
                                        {levelBadges.map(
                                            (badge: CombinedBadgeStatus) => {
                                                const cleanIconUrl =
                                                    badge.icon_url?.startsWith(
                                                        "/",
                                                    )
                                                        ? badge.icon_url.substring(
                                                              1,
                                                          )
                                                        : badge.icon_url;

                                                const imageUrl = cleanIconUrl
                                                    ? `${APP_BASE_PATH}${cleanIconUrl}`
                                                    : `${APP_BASE_PATH}assets/default-badge.png`;
                                                {
                                                    /* TODO: adicionar imagens de medalhas específicas*/
                                                }

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
                                                            src={imageUrl}
                                                            alt={badge.title}
                                                            className={classNames(
                                                                styles.badgeImage,
                                                                {
                                                                    [styles.badgeImageLocked]:
                                                                        !badge.has_earned,
                                                                },
                                                            )}
                                                        />
                                                        <h3
                                                            className={
                                                                styles.badgeTitle
                                                            }
                                                        >
                                                            {badge.title}
                                                        </h3>
                                                        <p
                                                            className={
                                                                styles.badgeDescription
                                                            }
                                                        >
                                                            {badge.description}
                                                        </p>
                                                        <div
                                                            className={classNames(
                                                                styles.badgeStatusText,
                                                                badge.has_earned
                                                                    ? styles.badgeStatusEarned
                                                                    : styles.badgeStatusLocked,
                                                            )}
                                                        >
                                                            {badge.has_earned
                                                                ? "CONQUISTADO"
                                                                : "BLOQUEADO"}
                                                        </div>
                                                    </li>
                                                );
                                            },
                                        )}
                                    </ul>
                                </div>
                            </div>
                        );
                    },
                )
            )}
        </div>
    );
}
