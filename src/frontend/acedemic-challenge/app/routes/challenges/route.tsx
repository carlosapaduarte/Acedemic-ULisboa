import { Challenge } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Batch } from "~/service/service";
import styles from "./challengesPage.module.css";
import { useChallenges } from "~/hooks/useChallenges";
import { ChallengeListItem } from "~/routes/challenges/ChallengeListItem";

function useChallengeList() {
    /* TODO: Check if this is the correct way to handle the state, implement level 3 too*/

    const { t } = useTranslation(["challenges"]);
    const { batches, currentBatch, currentDayIndex, challenges } = useChallenges();

    const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>(undefined);

    const [listedChallenges, setListedChallenges] = useState<Challenge[][] | undefined>(undefined);
    const [selectedChallenge, setSelectedChallenge] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!batches || !currentBatch) {
            return;
        }

        setSelectedBatch(currentBatch);
    }, [batches, currentBatch]);

    useEffect(() => {
        if (!challenges || !currentBatch || currentDayIndex == undefined)
            return;

        const batchChallenges = challenges.get(currentBatch.id);

        if (!batchChallenges)
            return;

        setListedChallenges(batchChallenges.slice(0, Math.min(currentDayIndex + 1, 21)));
    }, [challenges]);

    function onChallengeClickHandler(challengeIndex: number) {
        setSelectedChallenge(challengeIndex);
    }

    return { onChallengeClickHandler, listedChallenges };
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
                        const completed = challenges && challenges.length > index ? challenges[index][0].completionDate != null : false;

                        return <ChallengeListItem key={index}
                                                  completed={completed}
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

export default function ChallengesPage() {
    const { t } = useTranslation(["challenge_overview"]);
    const { onChallengeClickHandler, listedChallenges } = useChallengeList();

    return (
        <div className={`${styles.challengesPage}`}>
            <div className={`${styles.mainContent}`}>
                <div className={`${styles.challengesListContainer}`}>
                    <ChallengesList challenges={listedChallenges} onChallengeClickHandler={onChallengeClickHandler} />
                </div>
            </div>
        </div>
    );
}