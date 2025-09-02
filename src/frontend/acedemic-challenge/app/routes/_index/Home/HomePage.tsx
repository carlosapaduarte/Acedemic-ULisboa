import { Logger } from "tslog";
import React, { useEffect, useContext, useState } from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { ChallengesContext, useChallenges } from "~/hooks/useChallenges";
import { NotesModal } from "~/components/NotesModal/NotesModal";
import { service } from "~/service/service";
import SelectLevelPage from "~/routes/log-in/SelectLevelPage/SelectLevelPage";
import { useTranslation } from "react-i18next";
import RewardAnimation from "~/components/RewardAnimation";

const logger = new Logger({ name: "HomePage" });

function useHomePage() {
    const contextData = useContext(ChallengesContext);
    const { batchDays, currentBatch, currentDayIndex, fetchUserInfo } =
        contextData;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!batchDays || !currentBatch) return;

        const batchChallenges = batchDays.get(currentBatch.id);
        if (!batchChallenges) return;

        const allChallenges = batchChallenges.flatMap((b) => b.challenges);
        const completedCount = allChallenges.filter(
            (c) => c.completionDate,
        ).length;
        setProgress(
            allChallenges.length > 0
                ? (completedCount / allChallenges.length) * 100
                : 0,
        );
    }, [batchDays, currentBatch]);

    useEffect(() => {
        const pendingBadgeJSON = sessionStorage.getItem(
            "pendingBadgeAnimation",
        );
        if (pendingBadgeJSON) {
            try {
                const badge = JSON.parse(pendingBadgeJSON);
                contextData.showBadgeAnimation(badge);
                sessionStorage.removeItem("pendingBadgeAnimation");
            } catch (error) {
                console.error(
                    "Falha ao processar a animação de medalha pendente:",
                    error,
                );
                sessionStorage.removeItem("pendingBadgeAnimation");
            }
        }
    }, []);
    const currentBatchDays =
        batchDays && currentBatch ? batchDays.get(currentBatch.id) : undefined;
    const notesText =
        currentBatchDays && currentDayIndex !== undefined
            ? currentBatchDays[currentDayIndex].notes
            : "";

    async function onNoteAddClick(notesText: string) {
        if (currentDayIndex === undefined || !currentBatch) return;
        await service
            .editDayNote(currentBatch.id, currentDayIndex + 1, notesText)
            .then(() => fetchUserInfo());
    }

    return {
        ...contextData,
        progress,
        isModalOpen,
        setIsModalOpen,
        notesText,
        onNoteAddClick,
    };
}

function HomePageContent() {
    useAppBar("home");
    const { t } = useTranslation(["dashboard"]);
    const {
        batches,
        currentBatch,
        currentDayIndex,
        progress,
        fetchUserInfo,
        isModalOpen,
        setIsModalOpen,
        notesText,
        onNoteAddClick,
    } = useHomePage();

    return (
        <div className={styles.homePage}>
            {batches !== undefined && currentBatch === undefined ? (
                <>
                    <div className={styles.notOnBatchMessageContainer}>
                        <h1 className={styles.notOnBatchMessage}>
                            {t("dashboard:not_on_batch_message")}
                        </h1>
                    </div>
                    <SelectLevelPage
                        onLevelSelected={fetchUserInfo}
                        onStartQuizClick={() => {}}
                    />
                </>
            ) : (
                <>
                    <ProgressBar progress={progress} />
                    <ChallengeView
                        onViewNotesButtonClick={() => setIsModalOpen(true)}
                    />

                    {isModalOpen &&
                        currentBatch &&
                        typeof currentDayIndex === "number" && (
                            <NotesModal
                                batchDayNumber={currentDayIndex + 1}
                                isModalOpen={isModalOpen}
                                setIsModalOpen={setIsModalOpen}
                                savedNotesText={notesText}
                                onNotesSave={onNoteAddClick}
                            />
                        )}
                </>
            )}
        </div>
    );
}

export default function HomePage() {
    const challengeData = useChallenges();

    return (
        <ChallengesContext.Provider value={challengeData}>
            <HomePageContent />
            {challengeData.badgeForAnimation && (
                <RewardAnimation
                    awardedBadge={challengeData.badgeForAnimation}
                    onClose={challengeData.clearBadgeAnimation}
                />
            )}
        </ChallengesContext.Provider>
    );
}
