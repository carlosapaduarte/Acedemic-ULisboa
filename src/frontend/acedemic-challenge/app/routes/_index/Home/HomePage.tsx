import { Logger } from "tslog";
import React, { useEffect } from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { ChallengesContext, useChallenges } from "~/hooks/useChallenges";
import { NotesModal } from "~/components/NotesModal/NotesModal";
import { service } from "~/service/service";

const logger = new Logger({ name: "HomePage" });

function useHomePage() {
    const {
        userInfo,
        batches,
        batchDays,
        currentDayIndex,
        currentBatch,
        fetchUserInfo
    } = useChallenges();

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const batchChallenges = batchDays.get(currentBatch.id);

        if (!batchChallenges)
            return;

        const completedCount = batchChallenges.reduce(
            (acc, batchDay) => {
                const _acc = 0;
                batchDay.challenges.forEach(challenge => {
                    if (challenge.completionDate) {
                        acc++;
                    }
                })
                return acc + _acc; // TODO: Check if this is the correct way to check for completion
            }, 0);
        setProgress(completedCount / batchChallenges.flatMap(b => b.challenges).length * 100);
    }, [batchDays]);

    const currentBatchDays =
        batchDays != undefined && currentBatch != undefined
            ? batchDays.get(currentBatch.id)
            : undefined;
    const notesText = currentBatchDays != undefined && currentDayIndex != undefined ? currentBatchDays[currentDayIndex].notes : "";

    async function onNoteAddClick(notesText: string) {
        if (currentDayIndex == undefined || !currentBatch)
            return;

        await service.editDayNote(currentBatch.id, currentDayIndex + 1, notesText)
            .then(() => {
                fetchUserInfo();
            });
    }

    return {
        userInfo,
        batches,
        batchDays,
        currentDayIndex,
        currentBatch,
        fetchUserInfo,
        progress,
        isModalOpen,
        setIsModalOpen,
        notesText,
        onNoteAddClick
    };
}

export default function HomePage() {
    useAppBar("home");

    const {
        userInfo,
        batches,
        batchDays,
        currentDayIndex,
        currentBatch,
        fetchUserInfo,
        progress,
        isModalOpen,
        setIsModalOpen,
        notesText,
        onNoteAddClick
    } = useHomePage();

    return (
        <ChallengesContext.Provider
            value={{ userInfo, batches, batchDays, currentDayIndex, currentBatch, fetchUserInfo }}>
            <div className={styles.homePage}>
                <ProgressBar progress={progress} />
                <ChallengeView onViewNotesButtonClick={() => setIsModalOpen(true)} />
                {
                    currentDayIndex != undefined &&
                    <NotesModal batchDayNumber={currentDayIndex + 1}
                                isModalOpen={isModalOpen}
                                setIsModalOpen={setIsModalOpen}
                                savedNotesText={notesText}
                                onNotesSave={onNoteAddClick} />
                }
            </div>
        </ChallengesContext.Provider>
    );
}