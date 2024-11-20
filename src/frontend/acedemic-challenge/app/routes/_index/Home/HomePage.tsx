import { Logger } from "tslog";
import React, { useEffect } from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { ChallengesContext, useChallenges } from "~/hooks/useChallenges";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    useAppBar("home");
    const {
        userInfo,
        batches,
        batchDays,
        currentDayIndex,
        currentBatch,
        fetchUserInfo
    } = useChallenges();

    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        if (!batchDays || !currentBatch || currentDayIndex == undefined)
            return;

        const batchChallenges = batchDays.get(currentBatch.id);

        if (!batchChallenges)
            return;

        const completedCount = batchChallenges.reduce(
            (acc, batchDay) => {
                return acc + (batchDay.challenges[0].completionDate ? 1 : 0); // TODO: Check if this is the correct way to check for completion
            }, 0);
        setProgress(completedCount / batchChallenges.length * 100);
    }, [batchDays]);

    return (
        <ChallengesContext.Provider
            value={{ userInfo, batches, batchDays, currentDayIndex, currentBatch, fetchUserInfo }}>
            <div className={styles.homePage}>
                <ProgressBar progress={progress} />
                <ChallengeView />
            </div>
        </ChallengesContext.Provider>
    );
}