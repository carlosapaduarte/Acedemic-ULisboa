import React from "react";
import Confetti from "react-confetti";
import type { Badge, League } from "~/types/Badge";
import styles from "./RewardAnimation.module.css";

interface RewardAnimationProps {
    awardedBadge: Badge;
    onClose: () => void;
}

const APP_BASE_PATH = import.meta.env.BASE_URL || "/";

export default function RewardAnimation({
    awardedBadge,
    onClose,
}: RewardAnimationProps) {
    const imageUrl =
        awardedBadge.icon_url || `${APP_BASE_PATH}assets/default-badge.png`;

    // Verifica se a medalha é uma de "fim de nível" para uma animação maior com a imagem do nivel
    const isLevelUp =
        awardedBadge.code.includes("iniciante_determinado") ||
        awardedBadge.code.includes("cavaleiro_persistencia") ||
        awardedBadge.code.includes("campeao_autoeficacia");

    return (
        <div className={styles.overlay}>
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                numberOfPieces={isLevelUp ? 500 : 200}
            />
            <div
                className={`${styles.rewardCard} ${isLevelUp ? styles.levelUpCard : ""}`}
            >
                <h2>
                    {isLevelUp ? "NÍVEL COMPLETO!" : "TROFÉU DESBLOQUEADO!"}
                    {/* TODO: Traduzir */}
                </h2>
                <img
                    src={imageUrl}
                    alt={awardedBadge.title}
                    className={styles.badgeImage}
                />
                <h3 className={styles.badgeTitle}>{awardedBadge.title}</h3>
                <p className={styles.badgeDescription}>
                    {awardedBadge.description}
                </p>
                <button onClick={onClose} className={styles.closeButton}>
                    Continuar
                </button>
            </div>
        </div>
    );
}
