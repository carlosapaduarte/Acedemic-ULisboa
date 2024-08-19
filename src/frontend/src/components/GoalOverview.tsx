import {Accordion, AccordionDetails, AccordionSummary, Box, Typography} from "@mui/material";
import {utils} from "../utils";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {service, UserInfo} from "../service/service";
import {Goal} from "../challenges/types";
import {t} from "i18next";
import {ArrowDownward} from "@mui/icons-material";

// This makes it 21 challenges
const GOALS_PER_ROW = 7
const ROWS = 3
const GOAL_WITH = 100 / GOALS_PER_ROW

function GoalsAccordion({goals}: { goals: Goal[] }) {
    return (
        <Box display="flex" flexDirection="column" justifyContent="center">
            {goals.map((goal: Goal) =>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDownward/>}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <Typography>{goal.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            {goal.description}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    )
}

function GoalBox({goalIndex, achieved, onGoalClick}: {
    goalIndex: number,
    achieved: boolean,
    onGoalClick: (goalIndex: number) => void
}) {
    const opacity = achieved ? "100%" : "35%"
    return (
        <Box
            width={GOAL_WITH + "%"}
            sx={{backgroundColor: "green", color: "white", opacity}}
            margin="2%"
            alignItems="center"
            onClick={() => onGoalClick(goalIndex)}
        >
            <Typography sx={{fontSize: "180%"}}>{goalIndex + 1}</Typography>
        </Box>
    )
}

function GoalRow({rowIndex, currentGoal, onGoalClick}: {
    rowIndex: number,
    currentGoal: number,
    onGoalClick: (goalIndex: number) => void
}) {
    return (
        <Box display="flex" flexDirection="row" justifyContent="space-evenly">
            {Array.from(Array(GOALS_PER_ROW)).map((_, index) => {
                const goalIndex = GOALS_PER_ROW * rowIndex + index
                const visible = goalIndex <= currentGoal - 1
                return (
                    <GoalBox key={goalIndex} achieved={visible} goalIndex={goalIndex} onGoalClick={onGoalClick}/>
                )
            })}
        </Box>
    )
}

function Title() {
    return (
        <Box marginBottom="2%">
            <Typography variant="h2">
                {t("goal_overview:title")}
            </Typography>
        </Box>
    )
}

function Goals({goals, onGoalClickHandler}: { goals: Goal[][], onGoalClickHandler: (goalIndex: number) => void }) {
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" marginTop="2%"
             sx={{width: {sm: "100%", md: "70%"}}}>
            {Array.from(Array(ROWS)).map((_, rowIndex: number) => // TODO add flex wrap
                <GoalRow key={rowIndex} currentGoal={goals.length} rowIndex={rowIndex}
                         onGoalClick={onGoalClickHandler}/>
            )}
        </Box>
    )
}

export function GoalOverview() {
    const {userId} = useParams<string>()
    const userIdAsNumber = Number(userId) // TODO: 'userIdStr' could be undefined

    const [selectedGoal, setSelectedGoal] = useState<number | undefined>(undefined)

    // Ex: 16 if user in in day 16
    const [goals, setGoals] = useState<Goal[][] | undefined>(undefined)

    // Fetches a list of goals per each day
    useEffect(() => {
        service.fetchUserInfoFromApi(userIdAsNumber)
            .then((userInfo: UserInfo) => {
                const testStartDate = new Date()
                testStartDate.setDate(testStartDate.getDate() - 10)

                const goals = utils.getGoalsPerDayByStartDate(userInfo.level, testStartDate)
                setGoals(goals)
            })

    }, [])

    function onGoalClickHandler(goalIndex: number) {
        setSelectedGoal(goalIndex)
    }

    // Could be undefined if goals or selectedGoal is undefined, or if goals doesn't have selectedGoal index
    let goalsInfoToDisplay: Goal[] | undefined = (selectedGoal != undefined && goals) ? goals[selectedGoal] : undefined

    //console.log("Selected goal: ", selectedGoal)
    //console.log("Goals: ", goals)
    //console.log("Goals info to display: ", goalsInfoToDisplay)
    //console.log((selectedGoal && goals))

    return (
        <Box marginTop="2%">
            <Title/>
            <Box height="100%" display="flex" sx={{flexDirection: {xs: "column", md: "row"}}}>
                {
                    goals ? <Goals goals={goals} onGoalClickHandler={onGoalClickHandler}/> : <></>
                }
                <Box display="flex" flexDirection="column" justifyContent="center" sx={{width: {sm: "100%", md: "30%"}}}
                     padding="1%">
                    {
                        goalsInfoToDisplay ?
                            <GoalsAccordion goals={goalsInfoToDisplay}/>
                            :
                            <Typography variant="h5">{t("goal_overview:no_reached_message")}</Typography>
                    }
                </Box>
            </Box>
        </Box>
    )
}