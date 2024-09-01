// This makes it 21 challenges
import { Goal } from "~/challenges/types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { service, UserInfo } from "~/service/service";
import { utils } from "~/utils";
import { useUserId } from "~/components/auth/Authn";

const GOALS_PER_ROW = 7;
const ROWS = 3;
const GOAL_WITH = 100 / GOALS_PER_ROW;

function GoalsAccordion({ goals }: { goals: Goal[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {goals.map((goal: Goal) =>
                <div key={goal.title}>
                    <h1>
                        {goal.title}
                    </h1>
                    <p>
                        {goal.description}
                    </p>
                </div>
            )}
            {/*<Accordion>
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
                </Accordion>*/}
        </div>
    );
}

function GoalBox({ goalIndex, achieved, onGoalClick }: {
    goalIndex: number,
    achieved: boolean,
    onGoalClick: (goalIndex: number) => void
}) {
    const opacity = achieved ? "100%" : "35%";
    return (
        <div
            style={{
                width: GOAL_WITH + "%",
                backgroundColor: "green",
                color: "white",
                opacity: opacity,
                margin: "2%",
                alignItems: "center"
            }}
            onClick={() => onGoalClick(goalIndex)}
        >
            <p style={{ fontSize: "180%" }}>{goalIndex + 1}</p>
        </div>
    );
}

function GoalRow({ rowIndex, currentGoal, onGoalClick }: {
    rowIndex: number,
    currentGoal: number,
    onGoalClick: (goalIndex: number) => void
}) {
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
            {Array.from(Array(GOALS_PER_ROW)).map((_, index) => {
                const goalIndex = GOALS_PER_ROW * rowIndex + index;
                const visible = goalIndex <= currentGoal - 1;
                return (
                    <GoalBox key={goalIndex} achieved={visible} goalIndex={goalIndex} onGoalClick={onGoalClick} />
                );
            })}
        </div>
    );
}

function Title() {
    const { t } = useTranslation();
    return (
        <div style={{ marginBottom: "2%" }}>
            <h2>
                {t("goal_overview:title")}
            </h2>
        </div>
    );
}

function Goals({ goals, onGoalClickHandler }: { goals: Goal[][], onGoalClickHandler: (goalIndex: number) => void }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: "2%",
            width: "100%"
        }}>
            {Array.from(Array(ROWS)).map((_, rowIndex: number) => // TODO add flex wrap
                <GoalRow key={rowIndex} currentGoal={goals.length} rowIndex={rowIndex}
                         onGoalClick={onGoalClickHandler} />
            )}
        </div>
    );
}

function useChallenges() {
    const userId = useUserId();

    const [selectedGoal, setSelectedGoal] = useState<number | undefined>(undefined);

    // Ex: 16 if user in day 16
    const [goals, setGoals] = useState<Goal[][] | undefined>(undefined);

    // Fetches a list of goals per each day
    useEffect(() => {
        if (userId != undefined) {
            service.fetchUserInfoFromApi(userId)
                .then((userInfo: UserInfo) => {
                    const testStartDate = new Date();
                    testStartDate.setDate(testStartDate.getDate() - 10);

                    const batchToDisplay = userInfo.batches[0]
                    const level = batchToDisplay.level

                    const goals = utils.getGoalsPerDayByStartDate(level, testStartDate)
                    setGoals(goals);
                });
        }
    }, []);

    function onGoalClickHandler(goalIndex: number) {
        setSelectedGoal(goalIndex);
    }

    // Could be undefined if goals or selectedGoal is undefined, or if goals doesn't have selectedGoal index
    let goalsInfoToDisplay: Goal[] | undefined = (selectedGoal != undefined && goals) ? goals[selectedGoal] : undefined;

    //console.log("Selected goal: ", selectedGoal)
    //console.log("Goals: ", goals)
    //console.log("Goals info to display: ", goalsInfoToDisplay)
    //console.log((selectedGoal && goals))

    return { goalsInfoToDisplay, onGoalClickHandler, goals };
}

export default function Challenges() {
    const { t } = useTranslation();
    const { goalsInfoToDisplay, onGoalClickHandler, goals } = useChallenges();

    return (
        <div style={{ marginTop: "2%" }}>
            <Title />
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {
                    goals ? <Goals goals={goals} onGoalClickHandler={onGoalClickHandler} /> : <></>
                }
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    width: "100%",
                    padding: "1%"
                }}
                >
                    {
                        goalsInfoToDisplay ?
                            <GoalsAccordion goals={goalsInfoToDisplay} />
                            :
                            <h5>{t("goal_overview:no_reached_message")}</h5>
                    }
                </div>
            </div>
        </div>
    );
}