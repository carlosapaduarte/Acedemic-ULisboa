import { Challenge } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Batch, service, StoredChallenge, UserInfo } from "~/service/service";
import styles from "./challengesPage.module.css";
import classNames from "classnames";
import { getFullChallenge } from "~/challenges/getLevels";

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
        challengeTitle: string | undefined,
        challengeDescription: string | undefined,
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
    challenges: Challenge[][] | undefined,
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

    return (
        <div className={`${styles.challengesList}`}>
            {
                Array.from({ length: 21 }).map((_, index) => {
                        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

                        const title = challenges && challenges.length > index ? challenges[index][0].title : undefined;
                        const description = challenges && challenges.length > index ? challenges[index][0].description : undefined;

                        return <ChallengeBox key={index}
                                             challengeIndex={index}
                                             loading={challenges == undefined}
                                             challengeTitle={title}
                                             challengeDescription={description}
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

    const { t } = useTranslation(["challenges"]);
    const [currentBatch, setCurrentBatch] = useState<Batch | undefined>(undefined);
    const [storedChallenges, setStoredChallenges] = useState<StoredChallenge[][]>();

    useEffect(() => {
        service.fetchUserInfoFromApi()
            .then((userInfo: UserInfo) => {
                const currentBatch: Batch = userInfo.batches.sort((a, b) => b.startDate - a.startDate)[0];
                setCurrentBatch(currentBatch);

                const storedChallenges = userInfo.batches[userInfo.batches.length - 1].challenges;
                setStoredChallenges(storedChallenges);

                setLevel(currentBatch.level);

                const currentDayIndex = Math.round((new Date().getTime() - currentBatch.startDate * 1000) / (1000 * 3600 * 24));
                setChallenges(getFullTodayChallenges(currentBatch, storedChallenges, t, currentDayIndex));
            });
    }, []);

    useEffect(() => {
        if (!currentBatch || !storedChallenges)
            return;

        const currentDayIndex = Math.round((new Date().getTime() - currentBatch.startDate * 1000) / (1000 * 3600 * 24));

        setChallenges(getFullTodayChallenges(currentBatch, storedChallenges, t, currentDayIndex));
    }, [currentBatch, storedChallenges, t]);

    function getFullTodayChallenges(currentBatch: Batch, storedChallenges: StoredChallenge[][], t: any, currentDayIndex: number) {
        let todayChallenges: Challenge[][] = storedChallenges
            .slice(0, currentDayIndex + 1)
            .map((storedChallengeList) =>
                storedChallengeList
                    .map((storedChallenge) =>
                        getFullChallenge(currentBatch.level, storedChallenge, t)
                    )
            );
        return todayChallenges;
    }

    const [selectedChallenge, setSelectedChallenge] = useState<number | undefined>(undefined);
    const [level, setLevel] = useState<number | undefined>(undefined);
    const [challenges, setChallenges] = useState<Challenge[][] | undefined>(undefined);

    function onChallengeClickHandler(challengeIndex: number) {
        setSelectedChallenge(challengeIndex);
    }

    let challengesInfoToDisplay: Challenge[] | undefined = (selectedChallenge != undefined && challenges) ? challenges[selectedChallenge] : undefined;

    return { challengesInfoToDisplay, onChallengeClickHandler, challenges };
}

function MainContent() {
    const { t } = useTranslation(["challenge_overview"]);
    const { challengesInfoToDisplay, onChallengeClickHandler, challenges } = useChallenges();

    return (
        <div className={`${styles.mainContent}`}>
            <div className={`${styles.challengesListContainer}`}>
                <ChallengesList challenges={challenges} onChallengeClickHandler={onChallengeClickHandler} />
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