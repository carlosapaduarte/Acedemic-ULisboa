import { commons } from "./commons";
import { Challenge, DayChallenges } from "./types";

const level3StaticChallenge: Challenge[] = [
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
];

function level3Challenges(startDate: Date): DayChallenges[] {
    return commons.getDayChallenges(level3StaticChallenge, startDate, 3);
}

function getLevel3ChallengeList(): Challenge[] {
    return level3StaticChallenge;
}

export const Level3 = {
    level3Challenges,
    getLevel3ChallengeList
};
