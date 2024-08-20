import { Box, Button, Typography } from "@mui/material";
import { t } from "i18next";
import { useSetError } from "./error/ErrorContainer";
import { Level1 } from "../challenges/level_1";

function SelectLevel({onLevelClick} : {onLevelClick: (levelType: LevelType) => void}) {
    return (
        <Box display="flex" flexDirection="column">
            <Title/>
            <Levels onLevelClick={onLevelClick} />
        </Box>
    );
}

function Title() {
    return (
        <Box display="flex" justifyContent="center" marginBottom="5%" marginTop="3%">
            <Typography variant="h5">
                {t("login:select_level_initial_question")}
            </Typography>
        </Box>
    )
}

export enum LevelType { LEVEL_1 = 1, LEVEL_2 = 2, LEVEL_3 = 3 }

function getLevelTypes(): LevelType[] {
    const toReturn: LevelType[] =  []
    toReturn.push(LevelType.LEVEL_1)
    toReturn.push(LevelType.LEVEL_2)
    toReturn.push(LevelType.LEVEL_3)
    return toReturn
}

function Levels({onLevelClick} : {onLevelClick: (levelType: LevelType) => void}) {
    return (
        <Box display="flex" flexDirection="row" justifyContent="space-evenly">
            {getLevelTypes().map((levelType: LevelType) =>
                <Level levelType={levelType} onLevelClick={onLevelClick} />
            )}
        </Box>
    )
}


function Level({levelType, onLevelClick} : {levelType: LevelType, onLevelClick: (levelType: LevelType) => void}) {
    let title
    let description
    switch(levelType) {
        case LevelType.LEVEL_1: {
            title = t("login:level_1_title")
            description = t("login:level_1_description")
        }
        break
        case LevelType.LEVEL_2: {
            title = t("login:level_2_title")
            description = t("login:level_2_description")
        }
        break
        case LevelType.LEVEL_3: {
            title = t("login:level_3_title")
            description = t("login:level_3_description")
        }
        break
    }
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" width="30%">
            <Box marginBottom="10%">
                <img
                    src={"./test.webp"}
                    height="150px"
                    loading="lazy"
                />
            </Box>
            <Button 
                variant="contained" 
                size="medium"
                onClick={() => onLevelClick(levelType)} 
                sx={{marginBottom: "15%", fontSize: "120%"}}
            >
                {title}
            </Button>
            <Box height="100%" display="flex" justifyContent="center">
                <Typography width="80%">
                    {description}
                </Typography>
            </Box>
        </Box>
    )
}

export const SelectLevelComponent = {
    SelectLevel
}