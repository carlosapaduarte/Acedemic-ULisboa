import { Box, Button, Typography } from "@mui/material";
import { t } from "i18next";
import { useSetError } from "./components/error/ErrorContainer";
import { Level1 } from "./challenges/level_1";

export default function SelectLevel() {

    function onLevelClick() {

    }

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
                {t("login:initial_question")}
            </Typography>
        </Box>
    )
}

enum LevelType { LEVEL_1, LEVEL_2, LEVEL_3 }

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
            title = "Level 1"
            description = "Blablabla"
        }
        break
        case LevelType.LEVEL_2: {
            title = "Level 2"
            description = "Blablabla"
        }
        break
        case LevelType.LEVEL_3: {
            title = "Level 3"
            description = "Blablabla"
        }
        break
    }
    return (
        <Box display="flex" flexDirection="column" justifyContent="center">
            <Box marginBottom="15%">
                <img
                    src={"./test.webp"}
                    height="300"
                    loading="lazy"
                />
            </Box>
            <Button 
                variant="contained" 
                size="large" 
                onClick={() => onLevelClick(levelType)} 
                sx={{marginBottom: "15%", fontSize: "120%"}}
            >
                {title}
            </Button>
            <Typography>
                {description}
            </Typography>
        </Box>
    )
}