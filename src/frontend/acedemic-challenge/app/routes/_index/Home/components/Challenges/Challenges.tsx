import { BatchDay, Challenge } from "~/challenges/types";
import React from "react";
import { useState } from "react";
import { ReflectionModal } from "~/routes/_index/Home/components/ReflectionModal/ReflectionModal";

import styles from "./challenges.module.css";
import { useTranslation } from "react-i18next";

export default function Challenges({
    currentBatchDay,
    onMarkComplete,
    onViewNotesButtonClick,
}: {
    currentBatchDay: BatchDay;
    onMarkComplete: (challenge: Challenge, userAnswer: string | null) => void;
    onViewNotesButtonClick: () => void;
}) {
    const { t } = useTranslation(["dashboard"]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] =
        useState<Challenge | null>(null);

    const currentDayNumber = currentBatchDay.id;
    const challenges = currentBatchDay.challenges;

    const handleCompleteClick = (challenge: Challenge) => {
        console.log("DESAFIO CLICADO:", challenge);
        // Se o desafio tem uma pergunta, abre o modal
        if (challenge.reflection_prompt) {
            setSelectedChallenge(challenge);
            setIsModalOpen(true);
        } else {
            // Senão, completa diretamente sem resposta
            onMarkComplete(challenge, null);
        }
    };

    const handleModalSubmit = (userAnswer: string) => {
        if (selectedChallenge) {
            onMarkComplete(selectedChallenge, userAnswer);
        }
        setIsModalOpen(false);
        setSelectedChallenge(null);
    };

    const handleModalClose = () => {
        // Mesmo que o utilizador feche/salte, marca como completo
        if (selectedChallenge) {
            onMarkComplete(selectedChallenge, null);
        }
        setIsModalOpen(false);
        setSelectedChallenge(null);
    };

    // Per challenge, there is a "Mark Complete" button
    return (
        <div className={styles.challengeWrapper}>
            {currentBatchDay.level == 1 || currentBatchDay.level == 2 ? (
                <div
                    key={challenges[0].id}
                    className={styles.challengeContentContainer}
                >
                    <div className={styles.challengeContentScrollWrapper}>
                        <h1 className={styles.currentDayText}>
                            {t("dashboard:day")} {currentDayNumber}
                        </h1>
                        <div className={styles.challengeTitleContainer}>
                            <h2 className={styles.challengeTitle}>
                                {challenges[0].title}
                            </h2>
                            {challenges[0].completionDate != null ? (
                                <div className={styles.challengeCompleteTag}>
                                    {t("dashboard:challenge_completed")}
                                </div>
                            ) : (
                                <div className={styles.challengeIncompleteTag}>
                                    {t("dashboard:challenge_incomplete")}
                                </div>
                            )}
                        </div>
                        <p className={styles.challengeDescription}>
                            {challenges[0].description}
                        </p>
                        {challenges[0].completionDate &&
                            challenges[0].user_answer && (
                                <blockquote className={styles.userAnswerQuote}>
                                    <p>
                                        <strong>A sua resposta:</strong> "
                                        {challenges[0].user_answer}"
                                    </p>
                                </blockquote>
                            )}
                        <p className={styles.batchDayNotes}>
                            {currentBatchDay.notes != null &&
                            currentBatchDay.notes !== ""
                                ? `${t("dashboard:notes")}: ${currentBatchDay.notes}`
                                : t("dashboard:no_notes")}
                        </p>
                    </div>
                    <div className={styles.buttonsContainer}>
                        <button
                            className={styles.viewEditNotesButton}
                            onClick={() => onViewNotesButtonClick()}
                        >
                            {t("dashboard:view_edit_notes")}
                        </button>
                        {challenges[0].completionDate != null ? (
                            <></>
                        ) : (
                            <button
                                className={styles.completeChallengeButton}
                                onClick={() =>
                                    handleCompleteClick(challenges[0])
                                }
                            >
                                {t("dashboard:mark_complete")}
                            </button>
                        )}
                    </div>
                    {isModalOpen && selectedChallenge && (
                        <ReflectionModal
                            challenge={selectedChallenge}
                            onSubmit={handleModalSubmit}
                            onClose={handleModalClose}
                        />
                    )}
                </div>
            ) : (
                <>
                    {
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                overflow: "auto",
                            }}
                        >
                            <h1 className={styles.currentDayText}>
                                {t("dashboard:day")} {currentDayNumber}
                            </h1>
                            <div className={styles.dayContentContainer}>
                                <div className={styles.dayContentScrollWrapper}>
                                    {challenges.map((challenge: Challenge) => {
                                        return (
                                            <div
                                                key={challenge.id}
                                                className={
                                                    styles.challengeContentContainer
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.challengeContentScrollWrapper
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.challengeTitleContainer
                                                        }
                                                    >
                                                        <h2
                                                            className={
                                                                styles.challengeTitle
                                                            }
                                                        >
                                                            {challenge.title}
                                                        </h2>
                                                        {challenge.completionDate !=
                                                        null ? (
                                                            <div
                                                                className={
                                                                    styles.challengeCompleteTag
                                                                }
                                                            >
                                                                {t(
                                                                    "dashboard:challenge_completed",
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={
                                                                    styles.challengeIncompleteTag
                                                                }
                                                            >
                                                                {t(
                                                                    "dashboard:challenge_incomplete",
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p
                                                        className={
                                                            styles.challengeDescription
                                                        }
                                                    >
                                                        {challenge.description}
                                                    </p>
                                                    {challenge.completionDate &&
                                                        challenge.user_answer && (
                                                            <blockquote
                                                                className={
                                                                    styles.userAnswerQuote
                                                                }
                                                            >
                                                                <p>
                                                                    <strong>
                                                                        A sua
                                                                        resposta:
                                                                    </strong>{" "}
                                                                    "
                                                                    {
                                                                        challenge.user_answer
                                                                    }
                                                                    "
                                                                </p>
                                                            </blockquote>
                                                        )}
                                                    {challenge.completionDate !=
                                                    null ? (
                                                        <></>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.buttonsContainer
                                                            }
                                                        >
                                                            <button
                                                                className={
                                                                    styles.completeChallengeButton
                                                                }
                                                                onClick={() =>
                                                                    handleCompleteClick(
                                                                        challenge,
                                                                    )
                                                                }
                                                            >
                                                                {t(
                                                                    "dashboard:mark_complete",
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.buttonsContainer}>
                                <button
                                    className={styles.viewEditNotesButton}
                                    onClick={() => onViewNotesButtonClick()}
                                >
                                    {t("dashboard:view_edit_notes")}
                                </button>
                            </div>
                        </div>
                    }
                </>
            )}
        </div>
    );
}
