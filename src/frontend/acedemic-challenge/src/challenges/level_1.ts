import {commons} from "./commons"
import {DayGoals, Goal} from "./types"

// This object represents the challenges of level 1.
// Index 0 represents first day; Index 1 represents second day; etc...

const level1StaticGoal: Goal[] = [
    {
        title: "Despertar",
        description: "O primeiro dia é um convite para começares este desafio com o pé direito. É o primeiro passo para fazeres diferente, estares mais presente, sonhares e acreditares na concretização dos teus objetivos. Escolhe uma frase ou palavra que te inspire e repete-a ao longo do dia."
    },
    {
        title: "Caminhar em Consciência",
        description: "O segundo dia é um convite para definires metas: a arte de saber para onde se vai e com que propósito. Caminhar em consciência pressupõe saber onde estás agora e para onde queres ir. Por isso, estabelece pelo menos um objetivo académico específico que tenhas para esta semana. Escreve-o e coloca-o num local que seja visível para ti."
    },
    {
        title: "Planear",
        description: "Hoje o desafio é planeares o teu cronograma de estudo desta semana. Pensa nos objetivos que traçaste ontem e inclui no teu plano as tarefas que deves fazer diariamente."
    },
    {
        title: "Saber Saber",
        description: "Sabes aquele momento na época de exames em que pensas 'devia ter começado a estudar mais cedo'? O desafio de hoje é uma oportunidade para isso. Revê os principais conceitos dados nas tuas aulas de hoje. Dedica 25 minutos do teu dia a consolidar conhecimento."
    },
    {
        title: "Silenciar",
        description: "O quinto dia é um convite para silenciar. Encontra um local para um período de estudo sem distrações e desliga-te de tudo. Escolhe silenciar o mundo à tua volta durante 1 hora, colocando o teu telemóvel / tablet / computador em modo 'não incomodar' ou opta por desligar."
    },
    {
        title: "Página Diária",
        description: "Tens a leitura em dia? Escolhe um artigo, capítulo ou livro relacionado com o teu curso e lê pelo menos três páginas. Anota as tuas principais dúvidas e reflexões."
    },
    {
        title: "Dia da Compaixão",
        description: "No dia de hoje tenta ser o teu melhor amigo. Imagina que um amigo teu está a sentir-se desmotivado com a sua vida académica. Qual seria a melhor atitude que poderias ter para o ajudar? Aplica essa atitude a ti mesmo."
    },
    {
        title: "Bússola da Semana",
        description: "Parabéns! Chegaste ao fim de uma semana. Hoje é dia de refletir. Identifica as tarefas mais importantes a cumprir durante a próxima semana. Deixa essa lista num local de fácil acesso para ti. Pensa no que pode ser mais importante e urgente cumprir."
    },
    {
        title: "Pergunta",
        description: "No nono dia o convite é perguntar. Do que estudaste e leste até aqui, o que te levantou mais dúvidas? Pergunta a um professor ou colega uma dúvida que tenhas. Procura esclarecimentos e aprofunda a tua compreensão."
    },
    {
        title: "Atualiza-te",
        description: "Conheces ou utilizas alguma app que ajude a gerir o estudo? Se a tua resposta foi sim, dedica 20 minutos do dia de hoje a perceber o que tem funcionado bem e o que podes melhorar. Mas, se pelo contrário, ainda não aderiste a nada do género, conversa com um amigo ou colega e descobre o que ele utiliza. Aventura-te e conhece todo esse mundo! Nota: se a app do Diário de Bordo já tiver saído, o desafio passa a ser conhecê-la."
    },
    {
        title: "Organizar",
        description: "O décimo primeiro dia é um convite para organizar. Organiza os teus materiais de estudo e anotações. Não te esqueças de manter também o teu espaço de estudo arrumado e funcional."
    },
    {
        title: "Dia de Ser",
        description: "Hoje o desafio é um convite para te libertares da exigência. Cuida de ti e de quem és, dedicando 2 horas do teu dia ao lazer e ao descanso. O que te apetece fazer por ti hoje que seja em consciência? Deixares-te simplesmente ficar parado não vale…"
    },
    {
        title: "Ajudar",
        description: "Tens especial interesse por uma matéria e/ou sentes que a dominas? Oferece ajuda a um colega. Partilha o teu conhecimento e fortalece a colaboração e relação entre colegas. Vais ver que isso também te ajuda a estruturar o conhecimento que tens."
    },
    {
        title: "Saber Parar",
        description: "Quando estudas costumas fazer pausas? Hoje o desafio é precisamente esse. Aconteça o que aconteça no teu momento de estudo, dedica 10 minutos ao autocuidado. Faz uma caminhada ao ar-livre, meditação, uma pausa relaxante… o que te fizer sentir melhor."
    },
    {
        title: "Refletir",
        description: "Neste décimo quinto dia o convite é refletir. Reflete sobre um erro académico recente e sobre como podes melhorar. Aprende com os teus erros e ajusta as tuas estratégias. Se for mais fácil, lista os erros que identificas e propõe pelo menos uma estratégia para cada erro."
    },
    {
        title: "Estudo em Grupo",
        description: "Hoje o foco é a colaboração. Combina e reúne com alguns colegas para uma sessão de estudo. Escolhe um tópico que todos precisem rever e discutir. Aproveita a diversidade de conhecimentos e estratégias de estudo para enriquecer a tua aprendizagem."
    },
    {
        title: "Experimenta",
        description: "O décimo sétimo dia é um convite para experimentar. Escolhe uma técnica de estudo que ainda não tenhas utilizado. Flashcards, mapas mentais, método PLEMA, Feynman… há todo um mundo por explorares. Aventura-te e descobre o que melhor funciona para ti!"
    },
    {
        title: "Dia do Reconhecimento",
        description: "Hoje é dia de apreciar. Reflete sobre a tua trajetória académica até aqui. Enuncia um aspeto positivo da tua vida académica. Reconhece as tuas conquistas e valoriza o teu esforço. De que é que te orgulhas neste teu percurso?"
    },
    {
        title: "Saber Fazer",
        description: "O desafio do décimo nono dia é praticar. Se chegaste até aqui, muito leste e estudaste durante estes dias. Faz um exercício prático ou resolve um problema relacionado com uma das tuas unidades curriculares que tenhas achado muito difícil. Mostra-te que também sabes fazer!"
    },
    {
        title: "Superar o Medo",
        description: "Os grandes desafios trazem-nos grandes aprendizagens e transformações. Por isso, no vigésimo dia o convite é encares um desafio académico que tens evitado. Enfrenta os teus medos e supera as tuas dificuldades, dedicando 15 minutos a algo que tens evitado. Não te preocupes com a perfeição, o que realmente importa é começares. Tu és capaz!"
    },
    {
        title: "Dia da Vitória",
        description: "Acreditaste nestes 21 dias e fizeste acontecer. Agora, é hora de refletires sobre este percurso, celebrando as conquistas e traçando novos objetivos. O que levas deste desafio? Escreve uma palavra que defina esta experiência e escolhe três ações que vais implementar a partir daqui."
    }
]

function level1Goals(startDate: Date): DayGoals[] {
    return commons.getDayGoals(level1StaticGoal, startDate, 1)
}

function getLevel1GoalList(): Goal[] {
    return level1StaticGoal
}

export const Level1 = {
    level1Goals,
    getLevel1GoalList,
}