import { Box, Typography } from "@mui/material";

// This makes it 21 challenges
const GOALS_PER_ROW = 7
const ROWS = 3
const GOAL_WITH = 100 / GOALS_PER_ROW

function Goal({goalIndex, onGoalClick} : {goalIndex: number, onGoalClick: (goalIndex: number) => void}) {
    return (
        <Box width={GOAL_WITH + "%"} sx={{backgroundColor: "green", color: "white"}} margin="2%" alignItems="center" onClick={() => onGoalClick(goalIndex)} >
            <Typography sx={{fontSize: "180%"}}>{goalIndex}</Typography>
        </Box>
    )
}

function GoalRow({rowIndex, onGoalClick} : {rowIndex: number, onGoalClick: (goalIndex: number) => void}) {
    return (
        <Box display="flex" flexDirection="row" justifyContent="space-evenly">
            {Array.from(Array(GOALS_PER_ROW)).map((_, goalIndex) =>
                <Goal goalIndex={GOALS_PER_ROW * rowIndex + goalIndex + 1} onGoalClick={onGoalClick} />
            )}
        </Box>
    )
}

export function GoalOverview({onGoalClick} : {onGoalClick: (goalIndex: number) => void}) {
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" marginTop="2%">
            {Array.from(Array(ROWS)).map((_, rowIndex: number) => 
                <GoalRow rowIndex={rowIndex} onGoalClick={onGoalClick} />
            )}
        </Box>          
    )
}