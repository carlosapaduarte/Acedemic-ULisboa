// This object represents the challenges of level 3.
// Each index represents a different challenge.
// From day 1 to day 5, the assigned challenges are every challenge from day 1 to the correspondent day. 
// From day 5 and over, all challenges are assigned for the day.

import {commons} from "./commons"
import {DayGoals, Goal} from "./types"

const level3StaticGoal: Goal[] = [
    {
        id: 42,
        title: "Lista de Tarefas",
        description: "Elaborar / reajustar a minha lista de tarefas do dia, tendo em conta: os meus objetivos diários, obrigações e responsabilidade, revisões diárias de estudo, trabalhos, etc."
    },
    {
        id: 43,
        title: "Revisão do Dia",
        description: "Fazer uma revisão rápida dos conceitos dados nas aulas, através de apontamentos, sebentas, flahscards, vídeos, exercícios, slides das aulas, etc."
    },
    {
        id: 44,
        title: "Manter o Foco",
        description: "Conseguir estudar / elaborar trabalhos sem distrações durante pelo menos 1 hora."
    },
    {
        id: 45,
        title: "Tempo Para Mim",
        description: "Reservar, pelo menos, 30 minutos para uma atividade / tarefa que goste de fazer (e.g., exercício físico, ler, ouvir um podcast, correr, meditar)."
    },
    {
        id: 46,
        title: "Descansar",
        description: "Dormir o número de horas recomendadas para mim."
    }
]

function level3Goals(startDate: Date): DayGoals[] {
    return commons.getDayGoals(level3StaticGoal, startDate, 3)
}

function getLevel3GoalList(): Goal[] {
    return level3StaticGoal
}

export const Level3 = {
    level3Goals,
    getLevel3GoalList
}
