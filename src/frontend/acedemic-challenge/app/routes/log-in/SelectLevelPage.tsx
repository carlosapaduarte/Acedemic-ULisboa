import { t } from "i18next";
import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React from "react";
import { useTranslation } from "react-i18next";

export default function SelectLevelPage({
    userId,
    onLevelSelected,
    onStartQuizClick,
}: {
    userId: number;
    onLevelSelected: () => void;
    onStartQuizClick: () => void;
}) {
    const { onConfirmClick, selectedLevel, setSelectedLevel } =
        useSelectLevelPage({
            userId: userId,
            onLevelSelected: onLevelSelected,
            onStartQuizClick: onStartQuizClick,
        });
    const { t } = useTranslation();

    return (
        <div className="flex h-full w-full flex-row items-center justify-center">
            <div className="m-8 flex h-full w-full flex-col items-center">
                <Title />
                <Levels
                    selectedLevel={selectedLevel}
                    onLevelClick={setSelectedLevel}
                />
                <div className="flex h-full w-full items-center justify-center md:justify-end">
                    <button
                        className="cut-button h-16 w-64 bg-yellow text-2xl" /*hover:bg-yellow/85*/
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

function useSelectLevelPage({
    userId,
    onLevelSelected,
    onStartQuizClick,
}: {
    userId: number;
    onLevelSelected: () => void;
    onStartQuizClick: () => void;
}) {
    const [selectedLevel, setSelectedLevel] = React.useState<LevelType | null>(
        null,
    );

    const setError = useSetError();

    async function onConfirmClickHandler(level: LevelType) {
        await service
            .chooseLevel(userId, level) // returns if was successful or not
            .then(() => onLevelSelected())
            .catch((error) => setError(error));
    }

    // For now, no confirm button...
    // For now, no quiz button...
    // TODO

    return {
        onConfirmClick: onConfirmClickHandler,
        selectedLevel,
        setSelectedLevel,
    };
}

function Title() {
    return (
        <div className="mb-[5%] mt-[3%] flex justify-center">
            <h1 className="text-2xl text-white">
                {t("login:select_level_initial_question")}
            </h1>
        </div>
    );
}

function Levels({
    onLevelClick,
    selectedLevel,
}: {
    onLevelClick: (levelType: LevelType) => void;
    selectedLevel: LevelType | null;
}) {
    return (
        <div className="flex flex-col md:flex-row md:justify-center">
            {getLevelTypes().map((levelType: LevelType) => (
                <Level
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
    onLevelClick,
}: {
    selected: boolean;
    levelType: LevelType;
    onLevelClick: (levelType: LevelType) => void;
}) {
    const { title, description } = getLevelTitleAndDescription(levelType);

    return (
        <div className={"flex flex-row items-center md:w-[30%] md:flex-col"}>
            <div className="max-h-40 min-h-40 min-w-40 max-w-40 md:max-h-72 md:max-w-72">
                <img
                    src={`../../../public/lvl${levelType.valueOf()}.png`}
                    loading="lazy"
                    alt={`Level ${levelType.valueOf()} Image`}
                />
            </div>
            <div className="md: mr-4 flex flex-grow flex-col">
                <button
                    className={`cut-button h-12 w-full min-w-full text-xl font-bold md:mb-4 md:h-16 md:w-[80%] ${selected ? "bg-yellow" : ""}`} /*hover:bg-yellow/85*/
                    onClick={() => onLevelClick(levelType)}
                >
                    {title}
                </button>

                <div className="flex justify-center text-xs text-white md:text-base">
                    <h1 className="w-full">{description}</h1>
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
        case LevelType.LEVEL_1:
            {
                title = t("login:level_1_title");
                description = t("login:level_1_description");
            }
            break;
        case LevelType.LEVEL_2:
            {
                title = t("login:level_2_title");
                description = t("login:level_2_description");
            }
            break;
        case LevelType.LEVEL_3:
            {
                title = t("login:level_3_title");
                description = t("login:level_3_description");
            }
            break;
    }

    return { title, description };
}
