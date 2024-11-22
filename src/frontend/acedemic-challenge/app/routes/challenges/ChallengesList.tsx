import { Batch } from "~/service/service";
import { BatchDay, Challenge } from "~/challenges/types";
import { useSearchParams } from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import styles from "~/routes/challenges/challengesPage.module.css";
import { ChallengeListItem } from "~/routes/challenges/ChallengeListItem";
import { useTranslation } from "react-i18next";

function useChallengesList(
    batchDays: BatchDay[] | undefined,
    onChallengeClickHandler: (challengeIndex: number) => void
) {
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
        const index = Number(searchParams.get("day")) - 1;
        setSelectedItem(index);
        onChallengeClickHandler(index);
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

    return { selectedItem, lastSelectedItem, selectedRef, onItemClickHandler, currentChallenge };
}

export function ChallengesList(
    {
        batch,
        batchDays,
        onChallengeClickHandler,
        onMarkCompleteClickHandler,
        onNoteAddClick
    }: {
        batch: Batch | undefined,
        batchDays: BatchDay[] | undefined,
        onChallengeClickHandler: (challengeIndex: number) => void,
        onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
        onNoteAddClick: (notesText: string) => void
    }) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);
    const {
        selectedItem,
        lastSelectedItem,
        selectedRef,
        onItemClickHandler,
        currentChallenge
    } = useChallengesList(batchDays, onChallengeClickHandler);

    function Level1And2List() {
        return (
            <>{Array.from({ length: 21 }).map((_, index) => {
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
            })}</>
        );
    }

    function Level3List() {
        return (
            <></>
        );
    }

    return (
        <div className={`${styles.challengesList}`}>
            {
                Level1And2List()
            }
        </div>
    );
}