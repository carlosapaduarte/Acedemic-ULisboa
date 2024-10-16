import { Goal } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { service, UserInfo } from "~/service/service";
import { utils } from "~/utils";
import styles from "./challengesPage.module.css";
import { CutButton } from "~/components/Button/Button";
import { Level1 } from "~/challenges/level_1";
import classNames from "classnames";

/*
* TODO Make sure it adheres to the WAIA-ARIA design pattern for the Accordion:
*  https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
* */
function ChallengeBox(
    { challengeIndex, challengeTitle, challengeDescription, lastExpanded, expanded, reached, onChallengeClick }: {
        challengeIndex: number,
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
            <CutButton
                className={classNames(
                    styles.challengeBox,
                    reached ? "" : styles.locked,
                    expanded && reached ? styles.expanded : ""
                )}
                aria-expanded={reached ? (expanded) : undefined}
                aria-controls={reached ? `challengeDescription-${challengeIndex}` : undefined}
                onClick={() => onChallengeClick(challengeIndex)}>
                {
                    reached ?
                        <div className={`${styles.challengeContainer}`}>
                            <p className={`${styles.challengeTitle}`}>
                                <span className="visually-hidden">Challenge </span>
                                {challengeIndex + 1} - {challengeTitle}
                            </p>
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
                        :
                        <div className={`${styles.challengeContainer}`}>
                            <p className={`${styles.challengeTitle}`}>
                                <span className="visually-hidden">Locked challenge</span>
                                ?
                            </p>
                        </div>
                }
            </CutButton>
        </div>
    );
}

function ChallengesList({ challenges, onChallengeClickHandler }: {
    challenges: Goal[][],
    onChallengeClickHandler: (challengeIndex: number) => void
}) {
    const [selectedItem, setSelectedItem] = useState<number>(-1);
    const [lastSelectedItem, setLastSelectedItem] = useState<number>(-1);

    const currentChallenge = challenges.length;

    function onItemClickHandler(index: number) {
        const reached = index <= currentChallenge - 1;

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
                        const reached = index <= currentChallenge - 1;

                        return <ChallengeBox key={index}
                                             challengeIndex={index}
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

                startDate.setDate(startDate.getDate() - 2);

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
                {
                    goals ? <ChallengesList challenges={goals} onChallengeClickHandler={onGoalClickHandler} /> : <></>
                }
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