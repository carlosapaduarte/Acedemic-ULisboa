import React from "react";
import Confetti from "react-confetti";
import type { Badge } from "~/types/Badge";
import styles from "./RewardAnimation.module.css";

interface RewardAnimationProps {
    awardedBadge: Badge;
    onClose: () => void;
}

export default function RewardAnimation({
    awardedBadge,
    onClose,
}: RewardAnimationProps) {
    // Verifica se a medalha é uma de "fim de nível" para uma animação maior
    const isLevelUp =
        awardedBadge.code.includes("iniciante_determinado") ||
        awardedBadge.code.includes("cavaleiro_persistencia") ||
        awardedBadge.code.includes("campeao_autoeficacia");

    const imageUrl = `/challenge/badges/${awardedBadge.code}.png`;

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
                    {isLevelUp ? "NÍVEL CONCLUÍDO!" : "NOVA MEDALHA DESBLOQUEADA!"}
                </h2>
                
                <img
                    src={imageUrl}
                    alt={awardedBadge.title}
                    className={styles.badgeImage}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/challenge/avatars/challenge.png';
                    }}
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