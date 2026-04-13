import { service } from "~/service/service";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./selectLevelPage.module.css";
import { getChallengeIdList } from "~/challenges/getLevels";
import classNames from "classnames";

import RewardAnimation from "~/components/RewardAnimation"; 
import type { Badge } from "~/types/Badge";

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
    const [showNovatoBadge, setShowNovatoBadge] = useState(false);
    
    // Simulação do objeto badge para passar ao teu popup
    const novatoBadgeData: Badge = {
        id: 0, 
        code: "ac_novato",
        title: "Novato",
        description: "Após finalizar a autenticação na app.",
        icon_url: "/challenge/badges/ac_novato.png",
        app_scope: "academic_challenge",
        is_active: true
    };

    useEffect(() => {
        if (sessionStorage.getItem("show_novato_badge") === "true") {
            setShowNovatoBadge(true);
            sessionStorage.removeItem("show_novato_badge");
        }
    }, []);

    return (
        <>
            {showNovatoBadge && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                    <RewardAnimation 
                        awardedBadge={novatoBadgeData} 
                        onClose={() => setShowNovatoBadge(false)} 
                    />
                </div>
            )}

            <div className={styles.selectLevelPageContainer}>
                <div className={styles.selectLevelPageInnerContainer}>
                    <Title />
                    <Levels
                        selectedLevel={selectedLevel}
                        onLevelClick={setSelectedLevel}
                    />
                    <div className={styles.confirmButtonContainer}>
                        <button 
                            className={`${styles.confirmLevelButton}`}
                            // 💡 MAGIA MOBILE: onTouchEnd forçado
                            onTouchEnd={(e) => {
                                e.preventDefault(); // Impede o browser de baralhar o toque com scroll
                                if (selectedLevel !== null) onConfirmClick(selectedLevel);
                            }}
                            onClick={() => {
                                if (selectedLevel !== null) onConfirmClick(selectedLevel);
                            }}
                        >
                            {t("login:confirm_level")}
                        </button>
                    </div>
                </div>
            </div>
        </>
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
                    src={`/challenge/lvl${levelType.valueOf()}.png`}
                    alt={`Level ${levelType.valueOf()} Image`}
                    onError={(e) => { (e.target as HTMLImageElement).src = `lvl${levelType.valueOf()}.png`; }}
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