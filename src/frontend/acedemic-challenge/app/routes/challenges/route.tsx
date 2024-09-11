import { Goal } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { service, UserInfo } from "~/service/service";
import { utils } from "~/utils";
import { useUserId } from "~/components/auth/Authn";
import styles from "./challengesPage.module.css";
import { CutButton } from "~/components/Button/Button";
import { Level1 } from "~/challenges/level_1";

function ChallengeBox({ challengeIndex, challengeTitle, lastExpanded, expanded, reached, onChallengeClick }: {
    challengeIndex: number,
    challengeTitle: string,
    lastExpanded: boolean,
    expanded: boolean,
    reached: boolean,
    onChallengeClick: (challengeIndex: number) => void
}) {
    return (
        <div className={`
        ${styles.challengeBoxContainer}
        ${lastExpanded && reached ? styles.lastExpanded : ""}
        ${expanded && reached ? styles.expanded : ""}
        `}>
            <CutButton
                className={`
                ${styles.challengeBox} 
                ${reached ? "" : styles.locked} 
                ${expanded && reached ? styles.expanded : ""}
            `}
                onClick={() => onChallengeClick(challengeIndex)}>
                {
                    reached ?
                        <div className={`${styles.challengeContainer}`}>
                            <p className={`${styles.challengeTitle}`}>{challengeIndex + 1} - {challengeTitle}</p>
                            <div className={`${styles.challengeExpandableContainer}`}>
                                <div className={`${styles.challengeDescription}`}>
                                    Lorem ipsum odor amet, consectetuer adipiscing elit. Pharetra fusce primis
                                    suspendisse
                                    interdum pharetra cursus habitasse eu. Semper porttitor maecenas phasellus potenti
                                    malesuada
                                    quam maximus. Est lectus parturient netus justo convallis et. Pretium aenean vivamus
                                    commodo
                                    et dapibus viverra inceptos parturient primis. Natoque magna sapien; gravida rutrum
                                    sapien
                                    id gravida. Dolor nunc faucibus massa montes nam at habitant.Lorem ipsum odor amet,
                                    consectetuer adipiscing elit. Pharetra fusce primis suspendisse
                                    interdum pharetra cursus habitasse eu. Semper porttitor maecenas phasellus potenti
                                    malesuada
                                    quam maximus. Est lectus parturient netus justo convallis et. Pretium aenean vivamus
                                    commodo
                                    et dapibus viverra inceptos parturient primis. Natoque magna sapien; gravida rutrum
                                    sapien
                                    id gravida. Dolor nunc faucibus massa montes nam at habitant.Lorem ipsum odor amet,
                                    consectetuer adipiscing elit. Pharetra fusce primis suspendisse
                                    interdum pharetra cursus habitasse eu. Semper porttitor maecenas phasellus potenti
                                    malesuada
                                    quam maximus. Est lectus parturient netus justo convallis et. Pretium aenean vivamus
                                    commodo
                                    et dapibus viverra inceptos parturient primis. Natoque magna sapien; gravida rutrum
                                    sapien
                                    id gravida. Dolor nunc faucibus massa montes nam at habitant.
                                </div>
                            </div>
                        </div>
                        :
                        <div className={`${styles.challengeContainer}`}>
                            <p className={`${styles.challengeTitle}`}>?</p>
                        </div>
                }
            </CutButton>
        </div>
    );
}

function Title() {
    const { t } = useTranslation(["goal_overview"]);
    return (
        <div style={{ marginBottom: "2%" }}>
            <h2>
                {t("goal_overview:title")}
            </h2>
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

    return (
        <div className={`${styles.challengesList}`}>
            {
                Array.from({ length: 21 }).map((_, index) => {
                        const reached = index <= currentChallenge - 1;

                        return <ChallengeBox key={index}
                                             challengeIndex={index}
                                             challengeTitle={Level1.getLevel1GoalList()[index].title}
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
    const userId = useUserId((userId) => {
        service.fetchUserInfoFromApi(userId)
            .then((userInfo: UserInfo) => {
                const testStartDate = new Date();
                testStartDate.setDate(testStartDate.getDate() - 10);

                const batchToDisplay = userInfo.batches[0];
                const level = batchToDisplay.level;

                const challenges = utils.getChallengesPerDayByStartDate(level, testStartDate);
                setChallenges(challenges);
            });
    });

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