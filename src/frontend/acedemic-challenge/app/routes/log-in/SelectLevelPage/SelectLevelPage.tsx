import { service } from "~/service/service";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./selectLevelPage.module.css";
import { getChallengeIdList } from "~/challenges/getLevels";
import classNames from "classnames";

export default function SelectLevelPage(
    {
        onLevelSelected,
        onStartQuizClick
    }: {
        onLevelSelected: () => void;
        onStartQuizClick: () => void;
    }) {
    const { onConfirmClick, selectedLevel, setSelectedLevel } =
        useSelectLevelPage({
            onLevelSelected,
            onStartQuizClick
        });
    const { t } = useTranslation(["login"]);

    return (
        <div className={styles.selectLevelPageContainer}>
            <div className={styles.selectLevelPageInnerContainer}>
                <Title />
                <Levels
                    selectedLevel={selectedLevel}
                    onLevelClick={setSelectedLevel}
                />
                <div className={styles.confirmButtonContainer}>
                    <button className={`${styles.confirmLevelButton}`}
                            onClick={() => {
                                if (selectedLevel !== null)
                                    onConfirmClick(selectedLevel);
                            }}
                    >
                        {t("login:confirm_level")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function useSelectLevelPage(
    { onLevelSelected, onStartQuizClick }: {
        onLevelSelected: () => void;
        onStartQuizClick: () => void;
    }) {
    const [selectedLevel, setSelectedLevel] = React.useState<LevelType | null>(
        null
    );

    async function onConfirmClickHandler(level: LevelType) {
        await service
            .createBatch(level, getChallengeIdList(level))
            .then(() => onLevelSelected());
    }

    // TODO Quiz Button

    return {
        onConfirmClick: onConfirmClickHandler,
        selectedLevel,
        setSelectedLevel
    };
}

function Title() {
    const { t } = useTranslation(["login"]);

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
                    src={`lvl${levelType.valueOf()}.png`}
                    alt={`Level ${levelType.valueOf()} Image`}
                />
            </div>
            <div className={styles.levelContentContainer}>
                <button className={classNames(
                    styles.levelButton,
                    { [styles.selected]: selected }
                )}
                        onClick={() => onLevelClick(levelType)}
                >
                    {title}
                </button>

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
    const { t } = useTranslation(["login"]);

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
