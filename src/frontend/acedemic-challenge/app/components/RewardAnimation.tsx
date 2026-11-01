import React from "react";
import Confetti from "react-confetti";
import type { Badge } from "~/types/Badge";
import styles from "./RewardAnimation.module.css";
import { useTranslation } from "react-i18next";

interface RewardAnimationProps {
    awardedBadge: Badge;
    onClose: () => void;
}

export default function RewardAnimation({
    awardedBadge,
    onClose,
}: RewardAnimationProps) {
    const { t, i18n } = useTranslation(["badges"]);
    // Verifica se a medalha é uma de "fim de nível" para uma animação maior
    const isLevelUp =
        awardedBadge.code.includes("iniciante_determinado") ||
        awardedBadge.code.includes("cavaleiro_persistencia") ||
        awardedBadge.code.includes("campeao_autoeficacia");

    const badgeTitle = t(`badges:${awardedBadge.code}_title`, {
        defaultValue: awardedBadge.title,
    });
    const badgeDescription = t(`badges:${awardedBadge.code}_desc`, {
        defaultValue: awardedBadge.description,
    });
    const currentLang =
        i18n.resolvedLanguage?.startsWith("en") || i18n.language?.startsWith("en")
            ? "en"
            : "pt";
    const imageUrl = `/challenge/badges/${awardedBadge.code}_${currentLang}.png`;

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
                    {isLevelUp
                        ? t("badges:popup_level_complete")
                        : t("badges:popup_new_badge")}
                </h2>
                
                <img
                    src={imageUrl}
                    alt={badgeTitle}
                    className={styles.badgeImage}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/challenge/avatars/challenge.png';
                    }}
                />
                
                <h3 className={styles.badgeTitle}>{badgeTitle}</h3>
                <p className={styles.badgeDescription}>
                    {badgeDescription}
                </p>
                <button onClick={onClose} className={styles.closeButton}>
                    {t("badges:popup_continue")}
                </button>
            </div>
        </div>
    );
}