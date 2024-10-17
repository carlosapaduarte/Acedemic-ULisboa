import { Goal } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { service, UserInfo } from "~/service/service";
import { utils } from "~/utils";
import styles from "./challengesPage.module.css";
import { Level1 } from "~/challenges/level_1";
import classNames from "classnames";

/*
* TODO Make sure it adheres to the WAIA-ARIA design pattern for the Accordion:
*  https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
* */
function ChallengeBox(
    {
        challengeIndex,
        loading,
        challengeTitle,
        challengeDescription,
        lastExpanded,
        expanded,
        reached,
        onChallengeClick
    }: {
        challengeIndex: number,
        loading: boolean,
        challengeTitle: string,
        challengeDescription: string,
        lastExpanded: boolean,
        expanded: boolean,
        reached: boolean,
        onChallengeClick: (challengeIndex: number) => void
    }
) {
    return (
        <div className={
            classNames(
                styles.challengeBoxContainer,
                lastExpanded && reached ? styles.lastExpanded : "",
                expanded && reached ? styles.expanded : ""
            )}>
            {loading
                ?
                <div className={classNames(
                    styles.challengeBox,
                    styles.loading
                )}>
                    <div className={styles.challengeBoxButton}>
                        <p className={styles.challengeTitle}>
                            Loading...
                        </p>
                    </div>
                </div>
                :
                <div className={classNames(
                    styles.challengeBox,
                    reached ? "" : styles.locked,
                    expanded && reached ? styles.expanded : ""
                )}>
                    <button
                        className={classNames(styles.challengeBoxButton)}
                        aria-expanded={reached ? (expanded) : undefined}
                        aria-controls={reached ? `challengeDescription-${challengeIndex}` : undefined}
                        onClick={() => onChallengeClick(challengeIndex)}>
                        {
                            reached ?
                                <div className={`${styles.challengeContainer}`}
                                     aria-label={`Challenge ${challengeIndex + 1} - ${challengeTitle}`}
                                >
                                    <p className={`${styles.challengeTitle}`}>
                                        {challengeIndex + 1} - {challengeTitle}
                                    </p>
                                </div>
                                :
                                <div className={`${styles.challengeContainer}`}
                                     aria-label={"Locked challenge"}
                                >
                                    <p className={`${styles.challengeTitle}`}>
                                        ?
                                    </p>
                                </div>
                        }
                    </button>
                    <div
                        className={`${styles.challengeExpandableContainer}`}
                        id={`challengeDescription-${challengeIndex}`}
                        aria-hidden={!expanded}
                    >
                        <div className={`${styles.challengeDescription}`}>
                            {challengeDescription}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

function ChallengesList({ challenges, onChallengeClickHandler }: {
    challenges: Goal[][] | undefined,
    onChallengeClickHandler: (challengeIndex: number) => void
}) {
    const [selectedItem, setSelectedItem] = useState<number>(-1);
    const [lastSelectedItem, setLastSelectedItem] = useState<number>(-1);

    const currentChallenge = challenges?.length;

    function onItemClickHandler(index: number) {
        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

        if (!reached) {
            return;
        }

        if (selectedItem == index) {
            setSelectedItem(-1);
            return;
        }
        setLastSelectedItem(selectedItem);

        setSelectedItem(index);
    }

    console.log("Challenges: ", challenges);

    return (
        <div className={`${styles.challengesList}`}>
            {
                Array.from({ length: 21 }).map((_, index) => {
                        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

                        return <ChallengeBox key={index}
                                             challengeIndex={index}
                                             loading={challenges == undefined}
                                             challengeTitle={Level1.getLevel1GoalList()[index].title}
                                             challengeDescription={Level1.getLevel1GoalList()[index].description}
                                             lastExpanded={lastSelectedItem == index}
                                             expanded={selectedItem == index}
                                             reached={reached}
                                             onChallengeClick={onItemClickHandler} />;
                    }
                )
            }
        </div>
    );
}

function useChallenges() {
    /* TODO: Check if this is the correct way to handle the state, implement level 3 too*/

    useEffect(() => {
        service.fetchUserInfoFromApi()
            .then((userInfo: UserInfo) => {
                console.log("User info: ", userInfo);

                const batchToDisplay = userInfo.batches.sort((a, b) => b.startDate - a.startDate)[0];
                const level = batchToDisplay.level;
                const startDate = new Date(batchToDisplay.startDate * 1000);

                startDate.setDate(startDate.getDate() - 6);

                const challenges = utils.getChallengesPerDayByStartDate(level, startDate);
                setChallenges(challenges);
            });
    }, []);

    const [selectedChallenge, setSelectedChallenge] = useState<number | undefined>(undefined);
    const [goals, setChallenges] = useState<Goal[][] | undefined>(undefined);

    function onGoalClickHandler(goalIndex: number) {
        setSelectedChallenge(goalIndex);
    }

    let challengesInfoToDisplay: Goal[] | undefined = (selectedChallenge != undefined && goals) ? goals[selectedChallenge] : undefined;

    return { challengesInfoToDisplay, onGoalClickHandler, goals };
}

function MainContent() {
    const { t } = useTranslation(["goal_overview"]);
    const { challengesInfoToDisplay, onGoalClickHandler, goals } = useChallenges();

    return (
        <div className={`${styles.mainContent}`}>
            <div className={`${styles.challengesListContainer}`}>
                <ChallengesList challenges={goals} onChallengeClickHandler={onGoalClickHandler} />
            </div>
        </div>
    );
}

export default function ChallengesPage() {
    return (
        <div className={`${styles.challengesPage}`}>
            <MainContent />
        </div>
    );
}