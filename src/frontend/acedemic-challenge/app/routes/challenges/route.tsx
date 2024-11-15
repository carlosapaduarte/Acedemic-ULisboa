import { Challenge } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { Batch, service } from "~/service/service";
import styles from "./challengesPage.module.css";
import { useChallenges } from "~/hooks/useChallenges";
import { ChallengeListItem } from "~/routes/challenges/ChallengeListItem";
import { useSearchParams } from "@remix-run/react";

function useChallengeList() {
    /* TODO: Check if this is the correct way to handle the state, implement level 3 too*/

    const { t } = useTranslation(["challenges"]);
    const { batches, currentBatch, currentDayIndex, challenges, fetchUserInfo } = useChallenges();

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

    async function onMarkCompleteClickHandler(challenge: Challenge, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, challenge.id, challenge.challengeDay)
            .then(() => {
                fetchUserInfo();
            });
    }

    return { onChallengeClickHandler, listedChallenges, onMarkCompleteClickHandler, selectedBatch };
}

function ChallengesList({ batch, challenges, onChallengeClickHandler, onMarkCompleteClickHandler }: {
    batch: Batch | undefined,
    challenges: Challenge[][] | undefined,
    onChallengeClickHandler: (challengeIndex: number) => void,
    onMarkCompleteClickHandler: (challenge: Challenge, batch: Batch) => void
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedItem, setSelectedItem] = useState<number>(-1);
    const [lastSelectedItem, setLastSelectedItem] = useState<number>(-1);

    const selectedRef = useRef<HTMLDivElement>(null);

    const currentChallenge = challenges?.length;

    function onItemClickHandler(index: number) {
        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

        if (!reached) {
            return;
        }

        if (selectedItem == index) {
            setSelectedItem(-1);
            setSearchParams();
            return;
        }
        setLastSelectedItem(selectedItem);

        setSelectedItem(index);
        setSearchParams({ challengeDay: (index + 1).toString() });
    }

    useEffect(() => {
        setSelectedItem(Number(searchParams.get("challengeDay")) - 1);
    }, [searchParams]);


    const isFirstScroll = useRef(true);

    useEffect(() => {
        if (isFirstScroll.current && selectedRef.current) {
            isFirstScroll.current = false;

            setTimeout(() => {
                if (Number(searchParams.get("challengeDay")) - 1 >= 0 && selectedRef.current) {
                    selectedRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }, 200);
        }
    }, [selectedRef.current]);


    return (
        <div className={`${styles.challengesList}`}>
            {
                Array.from({ length: 21 }).map((_, index) => {
                        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

                        const title = challenges && challenges.length > index ? challenges[index][0].title : undefined;
                        const description = challenges && challenges.length > index ? challenges[index][0].description : undefined;
                        const completed = challenges && challenges.length > index ? challenges[index][0].completionDate != null : false;

                        return <ChallengeListItem key={index}
                                                  ref={selectedItem == index ? selectedRef : undefined}
                                                  completed={completed}
                                                  challengeIndex={index}
                                                  loading={challenges == undefined}
                                                  challengeTitle={title}
                                                  challengeDescription={description}
                                                  lastExpanded={lastSelectedItem == index}
                                                  expanded={selectedItem == index}
                                                  reached={reached}
                                                  onChallengeClick={onItemClickHandler}
                                                  onMarkComplete={() => {
                                                      if (!challenges || !batch) {
                                                          return;
                                                      }
                                                      onMarkCompleteClickHandler(challenges[index][0], batch);
                                                  }} />;
                    }
                )
            }
        </div>
    );
}

export default function ChallengesPage() {
    const { t } = useTranslation(["challenge_overview"]);
    const { onChallengeClickHandler, listedChallenges, onMarkCompleteClickHandler, selectedBatch } = useChallengeList();

    return (
        <div className={`${styles.challengesPage}`}>
            <div className={`${styles.mainContent}`}>
                <div className={`${styles.challengesListContainer}`}>
                    <ChallengesList batch={selectedBatch}
                                    challenges={listedChallenges} onChallengeClickHandler={onChallengeClickHandler}
                                    onMarkCompleteClickHandler={onMarkCompleteClickHandler} />
                </div>
            </div>
        </div>
    );
}