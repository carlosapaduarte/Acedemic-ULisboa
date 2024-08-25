import { t } from "i18next";
import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./selectLevelPage.module.css";
import { ConfirmButton, CutButton } from "~/components/Button";

export default function SelectLevelPage(
    {
        userId,
        onLevelSelected,
        onStartQuizClick
    }: {
        userId: number;
        onLevelSelected: () => void;
        onStartQuizClick: () => void;
    }) {
    const { onConfirmClick, selectedLevel, setSelectedLevel } =
        useSelectLevelPage({
            userId: userId,
            onLevelSelected: onLevelSelected,
            onStartQuizClick: onStartQuizClick
        });
    const { t } = useTranslation();

    return (
        <div className={styles.selectLevelPageContainer}>
            <div className={styles.selectLevelPageInnerContainer}>
                <Title />
                <Levels
                    selectedLevel={selectedLevel}
                    onLevelClick={setSelectedLevel}
                />
                <div className={styles.confirmButtonContainer}>
                    <ConfirmButton className={`${styles.confirmLevelButton}`}
                                   onClick={() => {
                                       if (selectedLevel !== null)
                                           onConfirmClick(selectedLevel);
                                   }}
                    >
                        {t("login:confirm_level")}
                    </ConfirmButton>
                </div>
            </div>
        </div>
    );
}

function useSelectLevelPage(
    { userId, onLevelSelected, onStartQuizClick }: {
        userId: number;
        onLevelSelected: () => void;
        onStartQuizClick: () => void;
    }) {
    const [selectedLevel, setSelectedLevel] = React.useState<LevelType | null>(
        null
    );

    const setError = useSetError();

    async function onConfirmClickHandler(level: LevelType) {
        await service
            .chooseLevel(userId, level) // returns if was successful or not
            .then(() => onLevelSelected())
            .catch((error) => setError(error));
    }

    // TODO Quiz Button

    return {
        onConfirmClick: onConfirmClickHandler,
        selectedLevel,
        setSelectedLevel
    };
}

function Title() {
    return (
        <div className={styles.titleContainer}>
            <h1 className={styles.titleHeading}>
                {t("login:select_level_initial_question")}
            </h1>
        </div>
    );
}

function Levels(
    {
        onLevelClick,
        selectedLevel
    }: {
        onLevelClick: (levelType: LevelType) => void;
        selectedLevel: LevelType | null;
    }) {
    return (
        <div className={styles.levelListContainer}>
            {getLevelTypes().map((levelType: LevelType) => (
                <Level
                    key={levelType.valueOf()}
                    selected={selectedLevel === levelType}
                    levelType={levelType}
                    onLevelClick={onLevelClick}
                />
            ))}
        </div>
    );
}

function Level({
                   selected,
                   levelType,
                   onLevelClick
               }: {
    selected: boolean;
    levelType: LevelType;
    onLevelClick: (levelType: LevelType) => void;
}) {
    const { title, description } = getLevelTitleAndDescription(levelType);

    return (
        <div className={styles.levelContainer}>
            <div className={styles.levelImageContainer}>
                <img
                    src={`../../../public/lvl${levelType.valueOf()}.png`}
                    loading="lazy"
                    alt={`Level ${levelType.valueOf()} Image`}
                />
            </div>
            <div className={styles.levelContentContainer}>
                <CutButton className={`${styles.levelButton} ${selected ? styles.selected : ""}`}
                           onClick={() => onLevelClick(levelType)}
                >
                    {title}
                </CutButton>

                <div className={styles.levelContentTextContainer}>
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
}

export enum LevelType {
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
}

function getLevelTypes(): LevelType[] {
    return [LevelType.LEVEL_3, LevelType.LEVEL_2, LevelType.LEVEL_1];
}

function getLevelTitleAndDescription(levelType: LevelType) {
    let title;
    let description;

    switch (levelType) {
        case LevelType.LEVEL_1: {
            title = t("login:level_1_title");
            description = t("login:level_1_description");
        }
            break;
        case LevelType.LEVEL_2: {
            title = t("login:level_2_title");
            description = t("login:level_2_description");
        }
            break;
        case LevelType.LEVEL_3: {
            title = t("login:level_3_title");
            description = t("login:level_3_description");
        }
            break;
    }

    return { title, description };
}
