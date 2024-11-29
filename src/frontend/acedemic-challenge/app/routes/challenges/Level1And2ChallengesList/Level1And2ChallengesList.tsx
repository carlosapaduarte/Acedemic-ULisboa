import styles from "./lvl1And2ChallengesList.module.css";
import React from "react";
import { Level1And2ChallengeListItem } from "~/routes/challenges/Level1And2ChallengesList/Level1And2ChallengeListItem";
import { Batch } from "~/service/service";
import { BatchDay, Challenge } from "~/challenges/types";


export function Level1And2ChallengesList(
    {
        batchDays,
        currentBatchDayNumber,
        onMarkCompleteClickHandler,
        onNoteAddClick,
        selectedItem,
        lastSelectedItem,
        selectedRef,
        onItemClickHandler,
        batch
    }: {
        batchDays: BatchDay[] | undefined,
        currentBatchDayNumber: number | undefined,
        onMarkCompleteClickHandler: (challenge: Challenge, batchDay: BatchDay, batch: Batch) => void,
        onNoteAddClick: (day: number, notes: string) => void,
        selectedItem: number,
        lastSelectedItem: number,
        selectedRef: React.RefObject<HTMLDivElement>,
        onItemClickHandler: (index: number) => void,
        batch: Batch | undefined
    }
) {
    return (
        <div className={styles.challengesList}>
            {Array.from({ length: 21 }).map((_, index) => {
                const reached = currentBatchDayNumber ? index <= currentBatchDayNumber - 1 : false;

                const notes = batchDays && batchDays.length > index ? batchDays[index].notes : undefined;

                const title = batchDays && batchDays.length > index ? batchDays[index].challenges[0].title : undefined;
                const description = batchDays && batchDays.length > index ? batchDays[index].challenges[0].description : undefined;
                const completed = batchDays && batchDays.length > index ? batchDays[index].challenges[0].completionDate != null : false;

                let ref: React.RefObject<HTMLDivElement> | undefined = undefined;
                if (selectedItem != -1 && selectedItem == index) {
                    ref = selectedRef;
                } else if (selectedItem == -1 && batchDays && currentBatchDayNumber != undefined && index == currentBatchDayNumber - 1) {
                    ref = selectedRef;
                }

                return <Level1And2ChallengeListItem
                    key={index}
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
                    onNoteAddClick={(notesText) => {
                        onNoteAddClick(index + 1, notesText);
                    }}
                />;
            })}
        </div>
    );
}