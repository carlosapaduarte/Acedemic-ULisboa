import { BatchDay, Challenge } from "~/challenges/types";
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
    const { batches, currentBatch, currentDayIndex, batchDays, fetchUserInfo } = useChallenges();

    const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>(undefined);

    const [listedBatchDays, setListedBatchDays] = useState<BatchDay[] | undefined>(undefined);
    const [selectedBatchDay, setSelectedBatchDay] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!batches || !currentBatch) {
            return;
        }

        setSelectedBatch(currentBatch);
    }, [batches, currentBatch]);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const currentBatchDays = batchDays.get(currentBatch.id);

        if (!currentBatchDays)
            return;

        setListedBatchDays(currentBatchDays.slice(0, Math.min(currentDayIndex + 1, 21)));
    }, [batchDays]);

    function onChallengeClickHandler(day: number) {
        setSelectedBatchDay(day);
    }

    async function onMarkCompleteClickHandler(challenge: Challenge, batchDay: BatchDay, batch: Batch) {
        await service.markChallengeAsCompleted(batch.id, batchDay.id, challenge.id)
            .then(() => {
                fetchUserInfo();
            });
    }

    async function onNoteAddClick(notesText: string) {
        if (!selectedBatch || selectedBatchDay == undefined) {
            return;
        }

        await service.editDayNote(selectedBatch.id, selectedBatch.batchDays[selectedBatchDay].id, notesText)
            .then(() => {
                fetchUserInfo();
            });
    }

    return { onChallengeClickHandler, listedBatchDays, onMarkCompleteClickHandler, selectedBatch, onNoteAddClick };
}

function ChallengesList({ batch, batchDays, onChallengeClickHandler, onMarkCompleteClickHandler, onNoteAddClick }: {
    batch: Batch | undefined,
    batchDays: BatchDay[] | undefined,
    onChallengeClickHandler: (challengeIndex: number) => void,
    onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
    onNoteAddClick: (notesText: string) => void
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedItem, setSelectedItem] = useState<number>(-1);
    const [lastSelectedItem, setLastSelectedItem] = useState<number>(-1);

    const selectedRef = useRef<HTMLDivElement>(null);

    const currentChallenge = batchDays?.length;

    function onItemClickHandler(index: number) {
        const reached = currentChallenge ? index <= currentChallenge - 1 : false;

        if (!reached) {
            return;
        }

        if (selectedItem == index) {
            setSelectedItem(-1);
            setSearchParams({}, { replace: true });
            return;
        }
        setLastSelectedItem(selectedItem);

        setSelectedItem(index);
        setSearchParams({ day: (index + 1).toString() }, { replace: true });
    }

    useEffect(() => {
        setSelectedItem(Number(searchParams.get("day")) - 1);
    }, [searchParams]);


    const isFirstScroll = useRef(true);

    useEffect(() => {
        if (isFirstScroll.current && selectedRef.current) {
            isFirstScroll.current = false;

            setTimeout(() => {
                if (selectedRef.current) {
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

                        const notes = batchDays && batchDays.length > index ? batchDays[index].notes : undefined;

                        const title = batchDays && batchDays.length > index ? batchDays[index].challenges[0].title : undefined;
                        const description = batchDays && batchDays.length > index ? batchDays[index].challenges[0].description : undefined;
                        const completed = batchDays && batchDays.length > index ? batchDays[index].challenges[0].completionDate != null : false;

                        let ref: React.RefObject<HTMLDivElement> | undefined = undefined;
                        if (selectedItem != -1 && selectedItem == index) {
                            ref = selectedRef;
                        } else if (selectedItem == -1 && batchDays && index == batchDays.length - 1) {
                            ref = selectedRef;
                        }

                        return <ChallengeListItem key={index}
                                                  ref={ref}
                                                  completed={completed}
                                                  challengeIndex={index}
                                                  loading={batchDays == undefined}
                                                  challengeTitle={title}
                                                  challengeDescription={description}
                                                  challengeNotes={notes}
                                                  lastExpanded={lastSelectedItem == index}
                                                  expanded={selectedItem == index}
                                                  reached={reached}
                                                  onChallengeClick={onItemClickHandler}
                                                  onMarkComplete={() => {
                                                      if (!batchDays || !batch) {
                                                          return;
                                                      }
                                                      onMarkCompleteClickHandler(batchDays[index].challenges[0], batchDays[index], batch);
                                                  }}
                                                  onNoteAddClick={onNoteAddClick}
                        />;
                    }
                )
            }
        </div>
    );
}

export default function ChallengesPage() {
    const { t } = useTranslation(["challenge_overview"]);
    const {
        onChallengeClickHandler, listedBatchDays, onMarkCompleteClickHandler, selectedBatch,
        onNoteAddClick
    } = useChallengeList();

    return (
        <div className={`${styles.challengesPage}`}>
            <div className={`${styles.mainContent}`}>
                <div className={`${styles.challengesListContainer}`}>
                    <ChallengesList batch={selectedBatch}
                                    batchDays={listedBatchDays} onChallengeClickHandler={onChallengeClickHandler}
                                    onMarkCompleteClickHandler={onMarkCompleteClickHandler}
                                    onNoteAddClick={onNoteAddClick} />
                </div>
            </div>
        </div>
    );
}