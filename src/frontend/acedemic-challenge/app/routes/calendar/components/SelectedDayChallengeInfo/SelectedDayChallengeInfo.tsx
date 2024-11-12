import { Challenge, DayChallenges } from "~/challenges/types";
import { utils } from "~/utils";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../calendarPage.module.css";
import { CutButton } from "~/components/Button/Button";

function useSelectedDayChallengeInfo({ challenges, selectedDay }: { challenges: DayChallenges[], selectedDay: Date }) {
    // TODO: only displaying one Challenge!!! There could be more

    function getSelectedDayChallenges(challenges: DayChallenges[]): Challenge[] {
        const challengesToReturn: Challenge[] = [];

        const challengesForTheDay = challenges.filter((challenge: DayChallenges) => {
            const date = challenge.date;
            return utils.sameDay(date, selectedDay);
        }).map((challenge: DayChallenges) => challenge.challenges);

        challengesForTheDay.forEach((challengesExterior: Challenge[]) => challengesExterior.forEach((challenge: Challenge) => challengesToReturn.push(challenge)));

        return challengesToReturn;
    }

    const challengesToDisplay = getSelectedDayChallenges(challenges); // Filters today's challenges

    return { challengesToDisplay };
}

export default function SelectedDayChallengeInfo({ challenges, selectedDay }: {
    challenges: DayChallenges[],
    selectedDay: Date
}) {
    const { challengesToDisplay } = useSelectedDayChallengeInfo({ challenges: challenges, selectedDay });
    const { t } = useTranslation(["calendar"]);

    useEffect(() => {
        function applyDynamicLineClamp() {
            if (challengesToDisplay.length == 0) {
                return;
            }

            setTimeout(() => {
                const description = document.getElementsByClassName(styles.challengeDescription)[0] as HTMLElement;
                const descriptionContainer = document.getElementsByClassName(styles.challengeDescriptionContainer)[0] as HTMLElement;
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
    }, [challengesToDisplay]);

    if (challengesToDisplay.length == 1) {
        const challenge = challengesToDisplay[0];
        return (
            <>
                <div className={`${styles.challengeTextContainer}`}>
                    <h2 className={`${styles.challengeTitle}`}>
                        {challenge.title}
                    </h2>
                    <div className={`${styles.challengeDescriptionContainer}`}>
                        <p className={`${styles.challengeDescription}`}>
                            {challenge.description}
                        </p>
                    </div>
                </div>
                <CutButton className={`${styles.seeMoreButton}`}>
                    {t("calendar:see_more_button_text")}
                </CutButton>
            </>
        );
    } else if (challengesToDisplay.length > 1) {
        return (
            <>
                {
                    challengesToDisplay.map((challenge: Challenge, index: number) =>
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
    } else
        return (
            <div className={`${styles.noChallengesTextContainer}`}>
                <h4 className={`${styles.noChallengesText}`}>
                    {t("calendar:no_challenges_title")}
                </h4>
            </div>
        );
}