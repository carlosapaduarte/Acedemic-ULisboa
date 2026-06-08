import React, { useState, useEffect, useMemo, useRef } from "react";
import type { CombinedBadgeStatus, League } from "~/types/Badge";
import classNames from "classnames";
import styles from "./badgesPage.module.css";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import Confetti from "react-confetti";
import { service } from "~/service/service";
import { useTranslation } from "react-i18next";

function useWindowSize() {
    const [size, setSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return size;
}

interface GamificationProfile {
    badges_status: CombinedBadgeStatus[];
    current_challenge_level: number | null;
    completed_level_ranks: number[];
}

const LevelStatusChip = ({ statusKey }: { statusKey: string }) => {
    const { t } = useTranslation(["badges"]);
    
    const chipStyles: { [key: string]: string } = {
        "IN_PROGRESS": styles.chipInProgress,
        "COMPLETED": styles.chipCompleted,
        "HAS_PROGRESS": styles.chipHasProgress,
        "NOT_SELECTED": styles.chipNotSelected,
    };
    
    return (
        <div className={classNames(styles.chip, chipStyles[statusKey])}>
            {t(`badges:status_${statusKey}`, statusKey)}
        </div>
    );
};

export async function loader({ request }: LoaderFunctionArgs) {
    return json({ locale: "pt" });
}

export default function BadgesPage() {
    const { t, i18n } = useTranslation(["badges"]);
    const navigate = useNavigate();
    const [badges, setBadges] = useState<CombinedBadgeStatus[]>([]);
    const [currentUserChallengeLevel, setCurrentUserChallengeLevel] = useState<number | null>(null);
    const [completedLevelRanks, setCompletedLevelRanks] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set());
    const [animatingLevel, setAnimatingLevel] = useState<number | null>(null);
    const { width, height } = useWindowSize(); 
    const [confettiSource, setConfettiSource] = useState<{ x: number; y: number; } | null>(null);
    const levelRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const currentLang = i18n.language?.startsWith("en") ? "en" : "pt";

    useEffect(() => {
        service.logUserAction("challenge", "page_view", "badges");
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data: GamificationProfile = await service.fetchGamificationProfile();
                setBadges(data.badges_status);
                setCurrentUserChallengeLevel(data.current_challenge_level);
                setCompletedLevelRanks(data.completed_level_ranks);
                if (data.current_challenge_level) {
                    setExpandedLevels(new Set([data.current_challenge_level]));
                }
            } catch (err: any) {
                if (err.name === "NotAuthorizedError") {
                    navigate("/log-in");
                    return;
                }
                setError(err.message || t("badges:error_loading", "Falha ao carregar o perfil de gamificação."));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate, t]);

    useEffect(() => {
        if (loading || badges.length === 0) return;
        const completedLevel = sessionStorage.getItem("justCompletedLevel");
        if (completedLevel) {
            const levelRank = parseInt(completedLevel, 10);
            const levelElement = levelRefs.current[levelRank];
            if (levelElement) {
                const rect = levelElement.getBoundingClientRect();
                setConfettiSource({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
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

    const toggleLevelExpansion = (rank: number) => {
        setExpandedLevels((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rank)) newSet.delete(rank);
            else newSet.add(rank);
            return newSet;
        });
    };

    const groupedAndSortedBadgesByLevel = useMemo(() => {
        const grouped = new Map<number, { league: League; badges: CombinedBadgeStatus[] }>();
        badges.forEach((badge) => {
            if (badge.league) {
                const leagueId = badge.league.id;
                if (!grouped.has(leagueId)) grouped.set(leagueId, { league: badge.league, badges: [] });
                grouped.get(leagueId)?.badges.push(badge);
            }
        });
        return Array.from(grouped.values()).sort((a, b) => a.league.rank - b.league.rank);
    }, [badges]);

    if (loading) return <p className="p-4 text-gray-300">{t("badges:loading", "A carregar medalhas...")}</p>;
    if (error) return <p className="p-4 text-red-400">{t("badges:error_prefix", "Erro:")} {error}</p>;

    return (
        <div className="p-4 min-h-screen bg-purple-900 text-gray-100 relative tutorial-target-badges-header">
            {animatingLevel !== null && confettiSource && (
                <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} initialVelocityX={{ min: -10, max: 10 }} initialVelocityY={{ min: -15, max: 5 }} confettiSource={confettiSource} />
            )}
            {groupedAndSortedBadgesByLevel.map(({ league, badges: levelBadges }, index) => {
                const earnedCount = levelBadges.filter((b) => b.has_earned).length;
                const totalCount = levelBadges.length;
                const allBadgesInLevelEarned = totalCount > 0 && earnedCount === totalCount;
                const isCompletedByRank = completedLevelRanks.includes(league.rank);
                const isCompleted = isCompletedByRank || allBadgesInLevelEarned;
                const isCurrent = league.rank === currentUserChallengeLevel;
                const hasProgress = earnedCount > 0;
                const isAccessible = isCurrent || isCompleted || hasProgress;
                
                let statusKey = isCompleted ? "COMPLETED" : isCurrent ? "IN_PROGRESS" : hasProgress ? "HAS_PROGRESS" : "NOT_SELECTED";
                const isExpanded = expandedLevels.has(league.rank);

                return (
                    <div key={league.id} ref={(el) => (levelRefs.current[league.rank] = el)} className={classNames(styles.levelContainer, { [styles.levelLocked]: !isAccessible, "tutorial-target-level-container": index === 0, })}>
                        <div className={styles.levelHeaderContainer} onClick={() => toggleLevelExpansion(league.rank)}>
                            <h2 className={styles.levelHeader}>{league.name}</h2>
                            <div className={styles.headerRight}>
                                <span className={styles.badgeCounter}>🏆 {earnedCount} / {totalCount}</span>
                                <div className={classNames({ [styles.chipAnimate]: animatingLevel === league.rank, })}>
                                    <LevelStatusChip statusKey={statusKey} />
                                </div>
                                <span className={classNames(styles.arrowIcon, { [styles.arrowExpanded]: isExpanded, })}>▼</span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className={styles.levelContent}>
                                {!isAccessible && (
                                    <div className={styles.lockedOverlay}>
                                        <div className={styles.lockIconContainer}>
                                            <img
                                                src={`/challenge/icons/padlock.svg`}
                                                alt={t("badges:locked_alt", "Nível Bloqueado")}
                                                className={styles.lockIconSvg}
                                            />
                                        </div>
                                    </div>
                                )}
                                <ul className={styles.badgesGrid}>
                                    {levelBadges.map((badge: CombinedBadgeStatus, badgeIndex) => (
                                        <li key={badge.id} className={classNames(styles.badgeItem, { [styles.badgeEarned]: badge.has_earned, [styles.badgeLocked]: !badge.has_earned, "tutorial-target-badge-item": index === 0 && badgeIndex === 0, })}>
                                            <img
                                                src={`/challenge/badges/${badge.code}_${currentLang}.png`}
                                                alt={badge.title}
                                                className={classNames(styles.badgeImage, {
                                                    [styles.badgeImageLocked]: !badge.has_earned,
                                                })}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.visibility = 'hidden'; 
                                                }}
                                            />
                                            <h3 className={styles.badgeTitle}>{badge.title}</h3>
                                            <p className={styles.badgeDescription}>{badge.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}