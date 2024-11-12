import { Logger } from "tslog";
import React, { useEffect } from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useChallenges } from "~/hooks/useChallenges";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    useAppBar("home");
    const {
        userInfo,
        challenges,
        currentDayIndex,
        currentBatch
    } = useChallenges();

    const [progress, setProgress] = React.useState(0);

    useEffect(() => {
        if (!challenges || !currentBatch || currentDayIndex == undefined)
            return;

        const batchChallenges = challenges.get(currentBatch.id);

        if (!batchChallenges)
            return;

        const completedCount = batchChallenges.reduce(
            (acc, challenges) => {
                return acc + (challenges[0].completionDate ? 1 : 0);
            }, 0);
        setProgress(completedCount / batchChallenges.length * 100);
    }, [challenges]);

    return (
        <div className={styles.homePage}>
            <ProgressBar progress={progress} />
            <ChallengeView />
        </div>
    );
}