import React, { useState, useEffect, useMemo } from "react";
import type { CombinedBadgeStatus, League } from "~/types/Badge";
import classNames from "classnames";
import styles from "./badgesPage.module.css";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const APP_BASE_PATH = import.meta.env.BASE_URL || "/";

interface GamificationProfile {
    badges_status: CombinedBadgeStatus[];
    current_challenge_level: number | null;
    completed_level_ranks: number[];
}

// Componente para o Chip de Status
const LevelStatusChip = ({ status }: { status: string }) => {
    const chipStyles: { [key: string]: string } = {
        "EM CURSO": styles.chipInProgress,
        "NÍVEL COMPLETADO": styles.chipCompleted,
        "PRÓXIMO NÍVEL": styles.chipNextLevel,
        "NÃO SELECIONADO": styles.chipNotSelected,
    };
    return (
        <div className={classNames(styles.chip, chipStyles[status])}>
            {status}
        </div>
    );
};

export async function loader({ request }: LoaderFunctionArgs) {
    return json({ locale: "pt" });
}

export default function BadgesPage() {
    const navigate = useNavigate();
    const [badges, setBadges] = useState<CombinedBadgeStatus[]>([]);
    const [currentUserChallengeLevel, setCurrentUserChallengeLevel] = useState<
        number | null
    >(null);
    const [completedLevelRanks, setCompletedLevelRanks] = useState<number[]>(
        [],
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedLevels, setExpandedLevels] = useState<Set<number>>(
        new Set(),
    );

    useEffect(() => {
        const fetchGamificationProfile = async () => {
            const token = localStorage.getItem("jwt");
            if (!token) {
                setError(
                    "Utilizador não autenticado. Faça login para ver as medalhas.",
                );
                navigate("/log-in");
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `${API_BASE_URL}/gamification/profile/me?app_scope=academic_challenge`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                if (!response.ok) {
                    // Se o erro for de não autorizado, redireciona para o login
                    if (response.status === 401) {
                        navigate("/log-in");
                        return;
                    }
                    const errorJson = await response.json();
                    throw new Error(
                        errorJson.detail ||
                            "Falha ao carregar o perfil de gamificação.",
                    );
                }

                const data: GamificationProfile = await response.json();
                setBadges(data.badges_status);
                setCurrentUserChallengeLevel(data.current_challenge_level);
                setCompletedLevelRanks(data.completed_level_ranks);

                if (data.current_challenge_level) {
                    setExpandedLevels(new Set([data.current_challenge_level]));
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

        fetchGamificationProfile();
    }, [navigate]);

    // Função para abrir/fechar um nível
    const toggleLevelExpansion = (rank: number) => {
        setExpandedLevels((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rank)) {
                newSet.delete(rank);
            } else {
                newSet.add(rank);
            }
            return newSet;
        });
    };

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
            {groupedAndSortedBadgesByLevel.map(
                ({ league, badges: levelBadges }) => {
                    const isCurrent = league.rank === currentUserChallengeLevel;
                    const allBadgesInLevelEarned =
                        levelBadges.length > 0 &&
                        levelBadges.every((b) => b.has_earned);

                    // Um nível está completo se o seu rank estiver na lista OU se for o nível 0 e todas as suas medalhas tiverem sido ganhas
                    const isCompleted =
                        completedLevelRanks.includes(league.rank) ||
                        (league.rank === 0 && allBadgesInLevelEarned);
                    const isFuture =
                        currentUserChallengeLevel !== null &&
                        league.rank > currentUserChallengeLevel;
                    const isLocked = isFuture && !isCompleted;

                    let statusText = "";
                    if (isCurrent) statusText = "EM CURSO";
                    else if (isCompleted) statusText = "NÍVEL COMPLETADO";
                    else if (isFuture) statusText = "PRÓXIMO NÍVEL";
                    else statusText = "NÃO SELECIONADO";

                    const isExpanded = expandedLevels.has(league.rank);

                    return (
                        <div
                            key={league.id}
                            className={classNames(styles.levelContainer, {
                                [styles.levelLocked]: isLocked,
                            })}
                        >
                            <div
                                className={styles.levelHeaderContainer}
                                onClick={() =>
                                    toggleLevelExpansion(league.rank)
                                }
                            >
                                <h2 className={styles.levelHeader}>
                                    {league.name}
                                </h2>
                                <div className={styles.headerRight}>
                                    <LevelStatusChip status={statusText} />
                                    {/* --- 3. ÍCONE DE SETA RETRÁTIL --- */}
                                    <span
                                        className={classNames(
                                            styles.arrowIcon,
                                            {
                                                [styles.arrowExpanded]:
                                                    isExpanded,
                                            },
                                        )}
                                    >
                                        ▼
                                    </span>
                                </div>
                            </div>

                            {/* --- Renderização condicional do conteúdo do nível --- */}
                            {isExpanded && (
                                <div className={styles.levelContent}>
                                    {isLocked && (
                                        <div className={styles.lockedOverlay}>
                                            <div
                                                className={
                                                    styles.lockIconContainer
                                                }
                                            >
                                                <img
                                                    src={`${APP_BASE_PATH}icons/padlock.svg`}
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
                                            (badge: CombinedBadgeStatus) => (
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
                                                            badge.icon_url
                                                                ? `${APP_BASE_PATH}${badge.icon_url.substring(1)}`
                                                                : ""
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
                                                    <h3
                                                        className={
                                                            styles.badgeTitle
                                                        }
                                                    >
                                                        {badge.title}
                                                    </h3>
                                                    {/* --- 4. MOSTRAR A DESCRIÇÃO DA MEDALHA --- */}
                                                    <p
                                                        className={
                                                            styles.badgeDescription
                                                        }
                                                    >
                                                        {badge.description}
                                                    </p>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                },
            )}
        </div>
    );
}
