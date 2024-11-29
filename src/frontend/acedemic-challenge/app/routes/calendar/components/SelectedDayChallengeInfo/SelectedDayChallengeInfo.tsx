import { BatchDay, Challenge } from "~/challenges/types";
import { utils } from "~/utils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../calendarPage.module.css";
import { useNavigate } from "@remix-run/react";

function useSelectedBatchDay({ daysWithChallenges, unreachedDays, selectedDay }: {
    daysWithChallenges: BatchDay[],
    unreachedDays: BatchDay[],
    selectedDay: Date
}) {
    const [selectedBatchDay, setSelectedBatchDay] = useState<BatchDay>();

    useEffect(() => {
        const days: BatchDay[] = [];
        days.push(...daysWithChallenges);
        days.push(...unreachedDays);

        setSelectedBatchDay(
            days.filter((batchDay: BatchDay) => {
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

export default function SelectedDayChallengeInfo({ daysWithChallenges, unreachedDays, selectedDay }: {
    daysWithChallenges: BatchDay[],
    unreachedDays: BatchDay[],
    selectedDay: Date
}) {
    const { selectedBatchDay } = useSelectedBatchDay({ daysWithChallenges, unreachedDays, selectedDay });
    const { t } = useTranslation(["calendar", "dashboard", "challenge_overview"]);
    const navigate = useNavigate();

    useDescriptionLineClamp({ selectedBatchDay });

    const reached = selectedBatchDay != undefined
        ? !unreachedDays.some((batchDay) => utils.sameDay(batchDay.date, selectedBatchDay.date))
        : false;

    if (selectedBatchDay == undefined || selectedBatchDay.challenges.length == 0) {
        return (
            <div className={`${styles.noChallengesTextContainer}`}>
                <h4 className={`${styles.noChallengesText}`}>
                    {t("calendar:no_challenges_title")}
                </h4>
            </div>
        );
    } else if (selectedBatchDay.level == 1 || selectedBatchDay.level == 2) {
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
                                <div className={styles.challengeIncompleteTag}>
                                    {t("dashboard:challenge_incomplete")}
                                </div>
                        }
                    </div>
                    <div className={`${styles.challengeDescriptionContainer}`}>
                        <p className={`${styles.challengeDescription}`}>
                            {challenge.description}
                        </p>
                    </div>
                </div>
                <button
                    className={`${styles.seeMoreButton}`}
                    onClick={() => navigate(`/challenges?day=${selectedBatchDay.id}`)}
                >
                    {t("calendar:see_more_button_text")}
                </button>
            </>
        );
    } else if (selectedBatchDay.level == 3) {
        return (
            <>
                <h2 className={`${styles.challengeTitle}`}>
                    {t("challenge_overview:day", { day: selectedBatchDay.id })}
                </h2>
                {
                    !reached ?
                        <div className={styles.challengeLockedTagContainer}>
                            {/*src="icons/lock_icon.svg"*/}
                            <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"
                                 width="30" height="30"
                                 fill="black"
                                 className={styles.challengeLockedLockIcon}>
                                <path
                                    d="M19,8V7A7,7,0,0,0,5,7V8H2V21a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V8ZM13,18H11V14h2ZM17,8H7V7A5,5,0,0,1,17,7Z" />
                            </svg>
                            <div className={styles.challengeLockedTag}>
                                {t("dashboard:challenges_locked")}
                            </div>
                        </div>
                        :
                        selectedBatchDay.challenges.map((challenge: Challenge, index: number) =>
                            <div key={index}>
                                <div className={`${styles.challengeTitleContainer}`}>
                                    <h2 className={`${styles.challengeTitle}`}>
                                        {challenge.title}
                                    </h2>
                                    {
                                        challenge.completionDate != null ?
                                            <div className={styles.challengeCompleteTag}>
                                                {t("dashboard:challenge_completed")}
                                            </div>
                                            :
                                            <div className={styles.challengeIncompleteTag}>
                                                {t("dashboard:challenge_incomplete")}
                                            </div>
                                    }
                                </div>
                                <p className={`${styles.challengeDescription}`}>
                                {challenge.description}
                                </p>
                            </div>
                        )
                }
            </>
        );
    } else {
        return (
            <div className={`${styles.noChallengesTextContainer}`}>
                <h4 className={`${styles.noChallengesText}`}>
                    {t("calendar:no_challenges_title")}
                </h4>
            </div>
        );
    }
}