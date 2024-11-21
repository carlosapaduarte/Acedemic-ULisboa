import styles from "./challengesPage.module.css";
import classNames from "classnames";
import React, { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CutButton } from "~/components/Button/Button";
import { NotesModal } from "~/components/NotesModal/NotesModal";


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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isLockedShaking, setIsLockedShaking] = useState(false);

    return (
        <>
            <NotesModal batchDayNumber={challengeIndex + 1}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        savedNotesText={challengeNotes ?? ""}
                        onNotesSave={onNoteAddClick} />
            <div
                key={challengeIndex}
                ref={ref}
                className={
                    classNames(
                        styles.challengeBoxContainer,
                        lastExpanded && reached ? styles.lastExpanded : "",
                        expanded && reached ? styles.expanded : "",
                        !reached && isLockedShaking ? styles.shakeAnimation : ""
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
                        reached ? "" : styles.locked,
                        expanded && reached ? styles.expanded : ""
                    )}>
                        <button
                            className={classNames(styles.challengeBoxButton)}
                            aria-expanded={reached ? (expanded) : undefined}
                            aria-controls={reached ? `challengeDescription-${challengeIndex}` : undefined}
                            onClick={() => {
                                if (!reached) {
                                    setIsLockedShaking(true);
                                    setTimeout(() => setIsLockedShaking(false), 300);
                                    return;
                                }

                                onChallengeClick(challengeIndex);
                            }}>
                            {
                                reached ?
                                    <div className={`${styles.challengeContainer}`}
                                         aria-label={`Challenge ${challengeIndex + 1} - ${challengeTitle}`}
                                    >
                                        <p className={`${styles.challengeTitle}`}>
                                            {challengeIndex + 1} - {challengeTitle}
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
                                         aria-label={"Locked challenge"}
                                    >
                                        <p className={`${styles.challengeTitle}`}>
                                            {challengeIndex + 1} - ?
                                        </p>
                                        <div className={styles.challengeLockedTag}>
                                            {t("dashboard:challenge_locked")}
                                        </div>
                                    </div>
                            }
                        </button>
                        <div
                            className={`${styles.challengeExpandableContainer}`}
                            id={`challengeDescription-${challengeIndex}`}
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
                                    <CutButton className={styles.addNoteButton}
                                               onClick={() => setIsModalOpen(true)}
                                               tabIndex={expanded ? 0 : -1}
                                    >
                                        {t("dashboard:view_edit_notes")}
                                    </CutButton>
                                    {
                                        completed ?
                                            <></>
                                            :
                                            <CutButton className={styles.completeChallengeButton}
                                                       onClick={() => onMarkComplete()}
                                                       tabIndex={expanded ? 0 : -1}
                                            >
                                                {t("dashboard:mark_complete")}
                                            </CutButton>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
});