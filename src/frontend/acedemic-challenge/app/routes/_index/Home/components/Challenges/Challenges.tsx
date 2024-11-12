import { Challenge } from "~/challenges/types";
import { CutButton } from "~/components/Button/Button";
import React from "react";

import styles from "./challenges.module.css";
import { useTranslation } from "react-i18next";

export default function Challenges({ currentDayNumber, challenges, onMarkComplete }: {
    currentDayNumber: number,
    challenges: Challenge[],
    onMarkComplete: (challenge: Challenge) => void
}) {
    const { t } = useTranslation(["dashboard"]);

    // Per challenge, there is a "Mark Complete" button
    return (
        <div>
            <h1 className={styles.currentDayText}>
                {t("dashboard:day")} {currentDayNumber}
            </h1>
            {challenges.map((challenge: Challenge) => {
                return (
                    <div key={challenge.id}
                         style={{ display: "flex", flexDirection: "column", justifyContent: "start" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <h2 className={styles.challengeTitle}>{challenge.title}</h2>
                            {
                                challenge.completionDate != null ?
                                    <p style={{
                                        textAlign: "left",
                                        width: "100%",
                                        marginBottom: "1%",
                                        textDecoration: "underline"
                                    }}>
                                        ({t("dashboard:challenge_completed")})
                                    </p>
                                    :
                                    <></>
                            }
                        </div>
                        <p className={styles.challengeDescription}>
                            {challenge.description}
                        </p>
                        <div className={styles.buttonsContainer}>
                            <CutButton className={styles.addNoteButton}>
                                {t("dashboard:add_note")}
                            </CutButton>
                            {
                                challenge.completionDate != null ?
                                    <></>
                                    :
                                    <CutButton className={styles.completeChallengeButton}
                                               onClick={() => onMarkComplete(challenge)}>
                                        {t("dashboard:mark_complete")}
                                    </CutButton>
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
}