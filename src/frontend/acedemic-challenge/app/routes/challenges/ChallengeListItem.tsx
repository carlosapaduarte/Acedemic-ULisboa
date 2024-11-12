import styles from "./challengesPage.module.css";
import classNames from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { CutButton } from "~/components/Button/Button";

/*
* TODO Make sure it adheres to the WAI-ARIA design pattern for the Accordion:
*  https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
* */
export function ChallengeListItem(
    {
        challengeIndex,
        completed,
        loading,
        challengeTitle,
        challengeDescription,
        lastExpanded,
        expanded,
        reached,
        onChallengeClick,
        onMarkComplete
    }: {
        challengeIndex: number,
        completed: boolean,
        loading: boolean,
        challengeTitle: string | undefined,
        challengeDescription: string | undefined,
        lastExpanded: boolean,
        expanded: boolean,
        reached: boolean,
        onChallengeClick: (challengeIndex: number) => void,
        onMarkComplete: () => void
    }
) {
    const { t } = useTranslation("dashboard");

    return (
        <div className={
            classNames(
                styles.challengeBoxContainer,
                lastExpanded && reached ? styles.lastExpanded : "",
                expanded && reached ? styles.expanded : ""
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
                        onClick={() => onChallengeClick(challengeIndex)}>
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
                                            <></>
                                    }
                                </div>
                                :
                                <div className={`${styles.challengeContainer}`}
                                     aria-label={"Locked challenge"}
                                >
                                    <p className={`${styles.challengeTitle}`}>
                                        ?
                                    </p>
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
                            <div className={styles.buttonsContainer}>
                                <CutButton className={styles.addNoteButton}>
                                    {t("dashboard:add_note")}
                                </CutButton>
                                {
                                    completed ?
                                        <></>
                                        :
                                        <CutButton className={styles.completeChallengeButton}
                                                   onClick={() => onMarkComplete()}>
                                            {t("dashboard:mark_complete")}
                                        </CutButton>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}