import React, { useState, useEffect, useMemo, useRef } from "react";
import type { CombinedBadgeStatus, League } from "~/types/Badge";
import classNames from "classnames";
import styles from "./badgesPage.module.css";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Confetti from "react-confetti";

function useWindowSize() {
    const [size, setSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return size;
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const APP_BASE_PATH = import.meta.env.BASE_URL || "/";

interface GamificationProfile {
    badges_status: CombinedBadgeStatus[];
    current_challenge_level: number | null;
    completed_level_ranks: number[];
}

//chip de Status
const LevelStatusChip = ({ status }: { status: string }) => {
    const chipStyles: { [key: string]: string } = {
        "EM CURSO": styles.chipInProgress,
        "NÍVEL COMPLETADO": styles.chipCompleted,
        "EM PROGRESSO": styles.chipHasProgress,
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
    // animação
    const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
    const { width, height } = useWindowSize(); //obter o tamanho da tela

    const [confettiSource, setConfettiSource] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const levelRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGamificationProfile();
    }, [navigate]);

    useEffect(() => {
        if (loading || badges.length === 0) {
            return;
        }

        const completedLevel = sessionStorage.getItem("justCompletedLevel");
        if (completedLevel) {
            const levelRank = parseInt(completedLevel, 10);
            const levelElement = levelRefs.current[levelRank];

            if (levelElement) {
                const rect = levelElement.getBoundingClientRect();
                setConfettiSource({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                });
            }

            setAnimatingLevel(levelRank);
            sessionStorage.removeItem("justCompletedLevel");

            const timer = setTimeout(() => {
                setAnimatingLevel(null);
                setConfettiSource(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [loading, badges]);

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
        <div className="p-4 min-h-screen bg-purple-900 text-gray-100 relative">
            {animatingLevel !== null && confettiSource && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                    // Os confetis agora explodem a partir do centro do nível
                    initialVelocityX={{ min: -10, max: 10 }}
                    initialVelocityY={{ min: -15, max: 5 }}
                    confettiSource={confettiSource}
                />
            )}

            {groupedAndSortedBadgesByLevel.map(
                ({ league, badges: levelBadges }) => {
                    const earnedCount = levelBadges.filter(
                        (b) => b.has_earned,
                    ).length;
                    const totalCount = levelBadges.length;
                    const allBadgesInLevelEarned =
                        totalCount > 0 && earnedCount === totalCount;
                    const isCompletedByRank = completedLevelRanks.includes(
                        league.rank,
                    );
                    const isCompleted =
                        isCompletedByRank || allBadgesInLevelEarned;

                    const isCurrent = league.rank === currentUserChallengeLevel;
                    const hasProgress = earnedCount > 0;
                    const isAccessible =
                        isCurrent || isCompleted || hasProgress;

                    let statusText = "";

                    if (isCompleted) {
                        statusText = "NÍVEL COMPLETADO";
                    } else if (isCurrent) {
                        statusText = "EM CURSO";
                    } else if (hasProgress) {
                        statusText = "EM PROGRESSO";
                    } else {
                        statusText = "NÃO SELECIONADO";
                    }

                    const isExpanded = expandedLevels.has(league.rank);

                    return (
                        <div
                            key={league.id}
                            ref={(el) => (levelRefs.current[league.rank] = el)}
                            className={classNames(styles.levelContainer, {
                                [styles.levelLocked]: !isAccessible,
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
                                    <span
                                        style={{
                                            color: "yellow",
                                            fontSize: "10px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        (A:{animatingLevel}|R:{league.rank})
                                    </span>

                                    <span className={styles.badgeCounter}>
                                        🏆{" "}
                                        {
                                            levelBadges.filter(
                                                (b) => b.has_earned,
                                            ).length
                                        }{" "}
                                        / {levelBadges.length}
                                    </span>
                                    <div
                                        className={classNames({
                                            [styles.chipAnimate]:
                                                animatingLevel === league.rank,
                                        })}
                                    >
                                        <LevelStatusChip status={statusText} />
                                    </div>
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

                            {isExpanded && (
                                <div className={styles.levelContent}>
                                    {!isAccessible && (
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
