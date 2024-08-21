import { t } from "i18next";

function SelectLevel({
    onLevelClick,
}: {
    onLevelClick: (levelType: LevelType) => void;
}) {
    return (
        <div className="flex h-full w-full flex-row items-center justify-center">
            <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center md:w-3/4">
                <Title />
                <Levels onLevelClick={onLevelClick} />
            </div>
        </div>
    );
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
}: {
    onLevelClick: (levelType: LevelType) => void;
}) {
    return (
        <div className="flex flex-row justify-center">
            {getLevelTypes().map((levelType: LevelType) => (
                <Level levelType={levelType} onLevelClick={onLevelClick} />
            ))}
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

function Level({
    levelType,
    onLevelClick,
}: {
    levelType: LevelType;
    onLevelClick: (levelType: LevelType) => void;
}) {
    const { title, description } = getLevelTitleAndDescription(levelType);

    return (
        <div className={"flex w-[30%] flex-col items-center"}>
            <div className="mb-[10%]">
                <img
                    src="public/test.webp"
                    width="200px"
                    loading="lazy"
                    alt={`Level ${levelType.valueOf()} Image`}
                />
            </div>

            <button
                className="cut-button mb-[15%] h-16 w-[80%] text-3xl hover:bg-yellow"
                onClick={() => onLevelClick(levelType)}
            >
                {title}
            </button>

            <div className="flex justify-center text-xl text-white">
                <h1 className="w-4/5">{description}</h1>
            </div>
        </div>
    );
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

export const SelectLevelComponent = {
    SelectLevel,
};
