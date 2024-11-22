import styles from "./challengesPage.module.css";
import classNames from "classnames";
import React, { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NotesModal } from "~/components/NotesModal/NotesModal";

function ChallengeBoxButton(
    {
        reached,
        expanded,
        completed,
        batchDayNumber,
        challengeTitle,
        onClick
    }: {
        reached: boolean,
        expanded: boolean,
        completed: boolean,
        batchDayNumber: number,
        challengeTitle: string,
        onClick: () => void
    }
) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    return (
        <button
            className={classNames(
                styles.challengeBoxButton,
                { [styles.reached]: reached },
                { [styles.expanded]: expanded && reached }
            )}
            aria-expanded={reached ? (expanded) : undefined}
            aria-controls={reached ? `challengeDescription-${batchDayNumber}` : undefined}
            onClick={onClick}>
            {
                reached ?
                    <div className={`${styles.challengeContainer}`}
                         aria-label={`Challenge ${batchDayNumber} - ${challengeTitle} - ${completed ? "completed" : "incomplete"}`}
                    >
                        <p className={`${styles.challengeTitle}`}>
                            {batchDayNumber} - {challengeTitle}
                        </p>
                        {
                            completed ?
                                <div className={styles.challengeCompleteTag}>
                                    {t("dashboard:challenge_completed")}
                                </div>
                                :
                                <div className={styles.challengeIncompleteTag}>
                                    {t("dashboard:challenge_incomplete")}
                                </div>
                        }
                    </div>
                    :
                    <div className={`${styles.challengeContainer}`}
                         aria-label={t("dashboard:challenge_locked")}
                    >
                        <p className={`${styles.challengeTitle}`}>
                            {batchDayNumber} - ?
                        </p>
                        <div className={styles.challengeLockedTagContainer}>
                            <img src="/icons/lock_icon.svg" alt=""
                                 width={20} height={20}
                                 className={styles.challengeLockedLockIcon} />
                            <div className={styles.challengeLockedTag}>
                                {t("dashboard:challenge_locked")}
                            </div>
                        </div>
                    </div>
            }
        </button>
    );
}

function ChallengeBoxExpandableContainer(
    {
        batchDayNumber,
        expanded,
        completed,
        challengeDescription,
        challengeNotes,
        onViewEditNotesButtonClick,
        onMarkCompleteButtonClick
    }: {
        batchDayNumber: number,
        expanded: boolean,
        completed: boolean,
        challengeDescription: string,
        challengeNotes: string,
        onViewEditNotesButtonClick: () => void,
        onMarkCompleteButtonClick: () => void
    }
) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    return (
        <div
            className={`${styles.challengeExpandableContainer}`}
            id={`challengeDescription-${batchDayNumber}`}
            aria-hidden={!expanded}
        >
            <div className={`${styles.challengeExpandableContainerContent}`}>
                <div className={`${styles.challengeDescription}`}>
                    {challengeDescription}
                </div>
                <div className={classNames(
                    styles.challengeNotes,
                    challengeNotes == null || challengeNotes == "" ? styles.empty : ""
                )}>
                    {challengeNotes != null && challengeNotes !== ""
                        ? `${t("dashboard:notes")}: ${challengeNotes}`
                        : t("dashboard:no_notes")
                    }
                </div>
                <div className={styles.buttonsContainer}>
                    <button className={styles.viewEditNotesButton}
                            onClick={onViewEditNotesButtonClick}
                            tabIndex={expanded ? 0 : -1}
                    >
                        {t("dashboard:view_edit_notes")}
                    </button>
                    {
                        completed ?
                            <></>
                            :
                            <button className={styles.completeChallengeButton}
                                    onClick={onMarkCompleteButtonClick}
                                    tabIndex={expanded ? 0 : -1}
                            >
                                {t("dashboard:mark_complete")}
                            </button>
                    }
                </div>
            </div>
        </div>
    );
}

/*
* TODO Make sure it adheres to the WAI-ARIA design pattern for the Accordion:
*  https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
* */
export const ChallengeListItem = forwardRef(function ChallengeListItem(
    {
        challengeIndex,
        completed,
        loading,
        challengeTitle,
        challengeDescription,
        challengeNotes,
        lastExpanded,
        expanded,
        reached,
        onChallengeClick,
        onMarkComplete,
        onNoteAddClick
    }: {
        challengeIndex: number,
        completed: boolean,
        loading: boolean,
        challengeTitle: string | undefined,
        challengeDescription: string | undefined,
        challengeNotes: string | undefined,
        lastExpanded: boolean,
        expanded: boolean,
        reached: boolean,
        onChallengeClick: (challengeIndex: number) => void,
        onMarkComplete: () => void,
        onNoteAddClick: (notesText: string) => void
    },
    ref?: React.Ref<HTMLDivElement>
) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

    const [isLockedShaking, setIsLockedShaking] = useState(false);

    return (
        <>
            <NotesModal batchDayNumber={challengeIndex + 1}
                        isModalOpen={isNotesModalOpen}
                        setIsModalOpen={setIsNotesModalOpen}
                        savedNotesText={challengeNotes ?? ""}
                        onNotesSave={onNoteAddClick} />
            <div
                key={challengeIndex}
                ref={ref}
                className={
                    classNames(
                        styles.challengeBoxContainer,
                        { [styles.lastExpanded]: lastExpanded && reached },
                        { [styles.expanded]: expanded && reached },
                        { [styles.shakeAnimation]: !reached && isLockedShaking }
                    )}>
                {loading
                    ?
                    <div className={classNames(
                        styles.challengeBox,
                        styles.loading
                    )}>
                        <div className={styles.challengeBoxButton}>
                            <p className={styles.challengeTitle}>
                                Loading...
                            </p>
                        </div>
                    </div>
                    :
                    <div className={classNames(
                        styles.challengeBox,
                        { [styles.locked]: !reached },
                        { [styles.expanded]: expanded && reached }
                    )}>
                        <ChallengeBoxButton
                            batchDayNumber={challengeIndex + 1}
                            challengeTitle={challengeTitle ?? ""}
                            reached={reached}
                            completed={completed}
                            expanded={expanded}
                            onClick={() => {
                                if (!reached) {
                                    setIsLockedShaking(true);
                                    setTimeout(() => setIsLockedShaking(false), 300);
                                    return;
                                }

                                onChallengeClick(challengeIndex);
                            }}
                        />
                        <ChallengeBoxExpandableContainer
                            batchDayNumber={challengeIndex + 1}
                            expanded={expanded}
                            completed={completed}
                            challengeDescription={challengeDescription ?? ""}
                            challengeNotes={challengeNotes ?? ""}
                            onViewEditNotesButtonClick={() => setIsNotesModalOpen(true)}
                            onMarkCompleteButtonClick={onMarkComplete}
                        />
                    </div>
                }
            </div>
        </>
    );
});