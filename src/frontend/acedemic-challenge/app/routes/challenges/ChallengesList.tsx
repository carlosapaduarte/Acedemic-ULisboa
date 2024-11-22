import { Batch } from "~/service/service";
import { BatchDay, Challenge } from "~/challenges/types";
import { useSearchParams } from "@remix-run/react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Level3ChallengesList } from "~/routes/challenges/Level3ChallengesList/Level3ChallengesList";
import { Level1And2ChallengesList } from "~/routes/challenges/Level1And2ChallengesList/Level1And2ChallengesList";

function useChallengesList(
    batchDays: BatchDay[] | undefined
) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedItem, setSelectedItem] = useState<number>(-1);
    const [lastSelectedItem, setLastSelectedItem] = useState<number>(-1);

    const selectedRef = useRef<HTMLDivElement>(null);

    const currentBatchDayNumber = batchDays?.length;

    function onItemClickHandler(index: number) {
        const reached = currentBatchDayNumber ? index <= currentBatchDayNumber - 1 : false;

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

    return { selectedItem, lastSelectedItem, selectedRef, onItemClickHandler, currentBatchDayNumber };
}

export function ChallengesList(
    {
        batch,
        batchDays,
        onMarkCompleteClickHandler,
        onNoteAddClick
    }: {
        batch: Batch | undefined,
        batchDays: BatchDay[] | undefined,
        onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
        onNoteAddClick: (batchDayNumber: number, notesText: string) => void
    }) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);
    const {
        selectedItem,
        lastSelectedItem,
        selectedRef,
        onItemClickHandler,
        currentBatchDayNumber
    } = useChallengesList(batchDays);

    /*const DEBUG_BATCH_LEVEL: number = 3;*/

    const batchLevel = batch?.level;

    return (
        <>
            {
                batch == undefined || batchDays == undefined || batchLevel == 1 || batchLevel == 2
                    ? <Level1And2ChallengesList
                        batchDays={batchDays}
                        currentBatchDayNumber={currentBatchDayNumber}
                        onMarkCompleteClickHandler={onMarkCompleteClickHandler}
                        onNoteAddClick={onNoteAddClick}
                        selectedItem={selectedItem}
                        lastSelectedItem={lastSelectedItem}
                        selectedRef={selectedRef}
                        onItemClickHandler={onItemClickHandler}
                        batch={batch}
                    />
                    : <Level3ChallengesList
                        batch={batch}
                        batchDays={batchDays}
                        onMarkCompleteClickHandler={onMarkCompleteClickHandler}
                        onNoteAddClick={onNoteAddClick}
                    />
            }
        </>
    );
}