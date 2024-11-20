import { BatchDay, Challenge } from "~/challenges/types";
import { utils } from "~/utils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../calendarPage.module.css";
import { CutButton } from "~/components/Button/Button";
import { useNavigate } from "@remix-run/react";

function useSelectedBatchDay({ daysWithChallenges, selectedDay }: {
    daysWithChallenges: BatchDay[],
    selectedDay: Date
}) {
    const [selectedBatchDay, setSelectedBatchDay] = useState<BatchDay>();

    useEffect(() => {
        setSelectedBatchDay(
            daysWithChallenges.filter((batchDay: BatchDay) => {
                return utils.sameDay(batchDay.date, selectedDay);
            })[0]
        );
    }, [daysWithChallenges, selectedDay]);

    return { selectedBatchDay };
}

function useDescriptionLineClamp({ selectedBatchDay }: { selectedBatchDay: BatchDay | undefined }) {
    useEffect(() => {
        function applyDynamicLineClamp() {
            if (selectedBatchDay != undefined && selectedBatchDay.challenges.length == 0) {
                return;
            }

            setTimeout(() => {
                const description = document.getElementsByClassName(styles.challengeDescription)[0] as HTMLElement;
                const descriptionContainer = document.getElementsByClassName(styles.challengeDescriptionContainer)[0] as HTMLElement;

                if (!description || !descriptionContainer) {
                    return;
                }

                const lineHeight = parseFloat(getComputedStyle(description).lineHeight);
                const containerHeight = descriptionContainer.clientHeight;

                // Calculate the number of lines that can fit in the container
                const maxLines = Math.floor(containerHeight / lineHeight);

                // Apply the -webkit-line-clamp with the calculated maxLines
                description.style.webkitLineClamp = maxLines.toString();
            }, 100);
        }

        // Call the function initially and on window resize
        applyDynamicLineClamp();
        window.addEventListener("resize", applyDynamicLineClamp);

        return () => {
            window.removeEventListener("resize", applyDynamicLineClamp);
        };
    }, [selectedBatchDay]);
}

export default function SelectedDayChallengeInfo({ daysWithChallenges, selectedDay }: {
    daysWithChallenges: BatchDay[],
    selectedDay: Date
}) {
    const { selectedBatchDay } = useSelectedBatchDay({ daysWithChallenges, selectedDay });
    const { t } = useTranslation(["calendar"]);
    const navigate = useNavigate();

    useDescriptionLineClamp({ selectedBatchDay });

    if (selectedBatchDay == undefined || selectedBatchDay.challenges.length == 0) {
        return (
            <div className={`${styles.noChallengesTextContainer}`}>
                <h4 className={`${styles.noChallengesText}`}>
                    {t("calendar:no_challenges_title")}
                </h4>
            </div>
        );
    } else if (selectedBatchDay.challenges.length == 1) {
        const challenge = selectedBatchDay.challenges[0];
        return (
            <>
                <div className={`${styles.challengeTextContainer}`}>
                    <div className={`${styles.challengeTitleContainer}`}>
                        <h2 className={`${styles.challengeTitle}`}>
                            {selectedBatchDay.id} - {challenge.title}
                        </h2>
                        {
                            challenge.completionDate != null ?
                                <div className={styles.challengeCompleteTag}>
                                    {t("dashboard:challenge_completed")}
                                </div>
                                :
                                <></>
                        }
                    </div>
                    <div className={`${styles.challengeDescriptionContainer}`}>
                        <p className={`${styles.challengeDescription}`}>
                            {challenge.description}
                        </p>
                    </div>
                </div>
                <CutButton
                    className={`${styles.seeMoreButton}`}
                    onClick={() => navigate(`/challenges?day=${selectedBatchDay.id}`)}
                >
                    {t("calendar:see_more_button_text")}
                </CutButton>
            </>
        );
    } else if (selectedBatchDay.challenges.length > 1) {
        return (
            <>
                {
                    selectedBatchDay.challenges.map((challenge: Challenge, index: number) =>
                        <div key={index}>
                            <h2 className={`${styles.challengeTitle}`}>
                                {challenge.title}
                            </h2>
                            <p className={`${styles.challengeDescription}`}>
                                {challenge.description}
                            </p>
                        </div>
                    )
                }
            </>
        );
    }
}