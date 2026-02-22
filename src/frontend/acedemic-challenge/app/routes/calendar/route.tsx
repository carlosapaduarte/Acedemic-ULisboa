import { Logger } from "tslog";
import React, { useContext } from "react";
import { BatchDay } from "~/challenges/types";
import { MyCalendar } from "~/routes/calendar/components/MyCalendar/MyCalendar";
import SelectedDayChallengeInfo from "~/routes/calendar/components/SelectedDayChallengeInfo/SelectedDayChallengeInfo";
import { useCalendar } from "~/routes/calendar/useCalendar";
import styles from "./calendarPage.module.css";
import { useTranslation } from "react-i18next";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { ChallengesContext } from "~/hooks/useChallenges";

const logger = new Logger({ name: "Calendar" });

function DayContent({
    reachedBatchDays,
    unreachedBatchDays,
    selectedDate,
}: {
    reachedBatchDays: BatchDay[];
    unreachedBatchDays: BatchDay[];
    selectedDate: Date;
}) {
    return (
        <div className={`${styles.challengesContainerWrapper}`}>
            <div
                className={`${styles.challengesContainer} tutorial-target-day-info`}
            >
                <SelectedDayChallengeInfo
                    reachedBatchDays={reachedBatchDays}
                    unreachedBatchDays={unreachedBatchDays}
                    selectedDay={selectedDate}
                />
            </div>
        </div>
    );
}

function MainContent() {
    const {
        reachedBatchDays,
        unreachedBatchDays,
        selectedDate,
        handleDateClick,
        fetchUserInfo,
        batches,
        currentBatch,
    } = useCalendar();
    const { badgeHistory } = useContext(ChallengesContext);
    const { t } = useTranslation(["dashboard"]);

    return (
        <div className={`${styles.mainContent}`}>
            {reachedBatchDays == undefined ||
            unreachedBatchDays == undefined ? (
                <h1 className={`${styles.loadingTextContainer}`}>
                    {`Loading Challenges and Calendar...`}
                </h1>
            ) : (
                <>
                    <div
                        className="tutorial-target-calendar-grid"
                        style={{
                            flex: 1,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <MyCalendar
                            reachedBatchDays={reachedBatchDays}
                            unreachedBatchDays={unreachedBatchDays}
                            onDayClickHandler={handleDateClick}
                            badgeHistory={badgeHistory}
                        />
                    </div>
                    <DayContent
                        reachedBatchDays={reachedBatchDays}
                        unreachedBatchDays={unreachedBatchDays}
                        selectedDate={selectedDate}
                    />
                </>
            )}
        </div>
    );
}

export default function CalendarPage() {
    return (
        <RequireAuthn>
            <div className={`${styles.calendarPage}`}>
                <MainContent />
            </div>
        </RequireAuthn>
    );
}
