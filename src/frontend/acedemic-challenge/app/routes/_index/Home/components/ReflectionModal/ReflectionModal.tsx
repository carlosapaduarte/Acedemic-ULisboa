import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Challenge } from "~/challenges/types";
import styles from "./ReflectionModal.module.css";

interface ReflectionModalProps {
    challenge: Challenge;
    onClose: () => void;
    onSubmit: (userAnswer: string) => void;
}

export function ReflectionModal({
    challenge,
    onClose,
    onSubmit,
}: ReflectionModalProps) {
    const { t } = useTranslation(["dashboard"]);
    const [answer, setAnswer] = useState("");

    const handleSubmit = () => {
        onSubmit(answer);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{challenge.title}</h2>

                <label
                    htmlFor="reflection-answer"
                    className={styles.reflectionPrompt}
                >
                    {challenge.reflection_prompt}
                </label>

                <textarea
                    id="reflection-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                    className={styles.reflectionTextarea}
                    placeholder={t("dashboard:reflection_placeholder")}
                    maxLength={300}
                />
                <div className={styles.charCounter}>{answer.length} / 300</div>

                <div className={styles.modalActions}>
                    <button
                        onClick={onClose}
                        className={styles.buttonSecondary}
                    >
                        {t("dashboard:skip_button")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={styles.buttonPrimary}
                    >
                        {t("dashboard:save_and_complete_button")}
                    </button>
                </div>
            </div>
        </div>
    );
}
