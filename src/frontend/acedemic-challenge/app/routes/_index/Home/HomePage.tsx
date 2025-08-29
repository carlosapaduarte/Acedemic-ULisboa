import { Logger } from "tslog";
import React, { useEffect, useContext } from "react";
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
    const {
        userInfo,
        batches,
        batchDays,
        currentDayIndex,
        currentBatch,
        fetchUserInfo,
        badgeHistory,
    } = useChallenges();

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined) return;

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

    const currentBatchDays =
        batchDays != undefined && currentBatch != undefined
            ? batchDays.get(currentBatch.id)
            : undefined;
    const notesText =
        currentBatchDays != undefined && currentDayIndex != undefined
            ? currentBatchDays[currentDayIndex].notes
            : "";

    async function onNoteAddClick(notesText: string) {
        if (currentDayIndex == undefined || !currentBatch) return;

        await service
            .editDayNote(currentBatch.id, currentDayIndex + 1, notesText)
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
        onNoteAddClick,
        badgeHistory,
    };
}

function HomePageContent() {
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
        onNoteAddClick,
    } = useHomePage();

    const { t } = useTranslation(["dashboard"]);

    return (
        <div className={styles.homePage}>
            {batches != undefined && currentBatch == undefined ? (
                <>
                    <div className={styles.notOnBatchMessageContainer}>
                        <h1 className={styles.notOnBatchMessage}>
                            {t("dashboard:not_on_batch_message")}
                        </h1>
                    </div>
                    <SelectLevelPage
                        onLevelSelected={() => fetchUserInfo()}
                        onStartQuizClick={() => {}}
                    />
                </>
            ) : (
                <>
                    <ProgressBar progress={progress} />
                    <ChallengeView
                        onViewNotesButtonClick={() => setIsModalOpen(true)}
                    />
                    {currentDayIndex != undefined && (
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
        // 2. O Provider envolve a sua UI e partilha a "caixa de ferramentas" completa.
        <ChallengesContext.Provider value={challengeData}>
            <HomePageContent />

            {/* 3. A Animação fica aqui, a escutar o estado global. */}
            {/* Seja o login ou um desafio a chamar `showBadgeAnimation`, esta animação será mostrada. */}
            {challengeData.badgeForAnimation && (
                <RewardAnimation
                    awardedBadge={challengeData.badgeForAnimation}
                    onClose={challengeData.clearBadgeAnimation}
                />
            )}
        </ChallengesContext.Provider>
    );
}
