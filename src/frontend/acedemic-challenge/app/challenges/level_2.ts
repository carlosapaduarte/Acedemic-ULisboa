import { commons } from "./commons";
import { Challenge, DayChallenges } from "./types";


const level2StaticChallenge: Challenge[] = [
    {
        id: 21,
        title: "Horizonte",
        description: "Bem-vindo ao primeiro desafio! Hoje é dia de estabelecer uma meta académica específica para a semana. O que queres realmente conseguir esta semana? Lembra-te: pode ser algo simbólico, o importante é que seja significativo para ti!"
    },
    {
        id: 22,
        title: "Planear",
        description: "Hoje o desafio é planear a semana. Pensa na meta que traçaste ontem e subdivide-a em objetivos diários, de forma a saberes quais as tarefas que deves realizar diariamente. Só assim vais conseguir acompanhar o teu progresso e reajustar estratégias. Cada vez que cumprires um objetivo estás um passo mais perto de atingir aquilo que ambicionas!"
    },
    {
        id: 23,
        title: "Priorizar",
        description: "Sabemos que, por vezes, pode ser tentador realizar várias tarefas ao mesmo tempo. Por isso, no terceiro dia o desafio é priorizar. Concentra-te na tarefa mais importante do dia e completa-a antes de dedicares o teu tempo a outras atividades. Antes de fazeres a tua escolha, verifica se há alguma tarefa importante que estás a evitar… Lembra-te que ao priorizar estás a garantir que o que é mais importante recebe a atenção que merece."
    },
    {
        id: 24,
        title: "Bem Mais Que Rever",
        description: "No quarto dia o desafio é uma oportunidade para ter o estudo em dia. Revê os conceitos dados nas tuas aulas de hoje, dedicando 90 minutos do teu dia a consolidar conhecimento. Para cada conteúdo e/ou bibliografia que estudares elabora uma ficha de estudo / síntese. Afinal, rever é a melhor forma de garantir uma aprendizagem profunda e duradoura."
    },
    {
        id: 25,
        title: "Silenciar",
        description: "O quinto dia é um convite para silenciar. Encontra um local para um período de estudo sem distrações e desliga-te de tudo. Define quanto tempo vais estudar e escolhe silenciar o mundo à tua volta nesse período, colocando o teu telemóvel / tablet / computador em modo “não incomodar” ou opta por desligar. Não te esqueças de incorporar pausas no estudo!"
    },
    {
        id: 26,
        title: "Análise Crítica",
        description: "Tens a leitura em dia? Escolhe um artigo ou capítulo relacionado com o teu curso e escreve uma análise crítica ao seu conteúdo. Pensa nos seus pontos fortes e fracos e nas tuas próprias interpretações do material. Esta é uma oportunidade de exercitares o teu pensamento crítico e aprofundar conhecimento. Não tenhas medo de expressar as tuas interpretações!"
    },
    {
        id: 27,
        title: "Diário",
        description: "Sabes as dúvidas que te surgiram na análise crítica de ontem? O sétimo dia é um convite ao registo. Refletir e registar ideias é um passo muito importante para o teu crescimento enquanto estudante. Experimenta anotar as tuas dúvidas e insights. Um diário de estudo é uma ferramenta valiosa para organizar o pensamento. E… não te preocupes se as respostas não vierem todas rapidamente, o que importa é que estás a procurar aprender a cada dia!"
    },
    {
        id: 28,
        title: "Celebrar",
        description: "No final desta primeira semana de desafio, tira um momento para reconheceres o teu esforço. Reflete sobre como avançaste nos teus objetivos da semana e recompensa-te de forma saudável, mesmo que não te sintas totalmente satisfeito. Celebrar os pequenos passos ajuda a manter a motivação e reconhecer o teu valor. Como recompensa podes pensar em algo simples, como ter tempo de lazer, fazer uma atividade que gostas ou então podes optar por um presente para ti mesmo! Continua a esforçar-te, estás a fazer um trabalho incrível!"
    },
    {
        id: 29,
        title: "Pé Direito",
        description: "Hoje é dia de começar a semana com o pé direito, organizando as fichas de estudo / síntese dos conteúdos dados nas aulas da semana que passou. Lembra-te que ter o estudo organizado traz sensação de controlo e confiança. Vais ver que não custa assim tanto..."
    },
    {
        id: 30,
        title: "Conexão",
        description: "Hoje o desafio é cuidares em ti. Reserva pelo menos 30 minutos para uma caminhada ao ar livre de preferência numa zona verde. Permite-te desligar de preocupações e responsabilidades. Conecta-te com a natureza, apreciando a vista, os sons e os cheiros. Aproveita cada minuto sem peso na consciência. Cuidares de ti é essencial para manteres a motivação e a concentração."
    },
    {
        id: 31,
        title: "Superar",
        description: "Sabes aquele trabalho / exercício que estás a evitar fazer há imenso tempo? Hoje é dia de te dedicares a ele. Enfrenta os teus medos e supera as tuas dificuldades, dedicando pelo menos 1 hora a algo que tens evitado. Não te preocupes com a perfeição, o que importa é começares."
    },
    {
        id: 32,
        title: "Treino",
        description: "No décimo segundo dia o desafio é melhorar as tuas capacidades de comunicação. Tens uma apresentação de um trabalho em breve? Um seminário / congresso? Dedica tempo a treinar essa apresentação. Vais ver como te vais sentir mais confiante a enfrentar o público!"
    },
    {
        id: 33,
        title: "Mentoria",
        description: "Hoje o desafio é deixares-te ser ajudado. Se sentes que precisas de orientação nos estudos procura um mentor. Podes recorrer ao horário de dúvidas de um Professor, a um colega mais experiente ou até mesmo a alguém fora da Faculdade. Se na tua Faculdade existir um programa de mentorado, podes procurar também lá a tua ajuda! Se não, sê criativo na tua busca!"
    },
    {
        id: 34,
        title: "Pergunta do Dia",
        description: "O décimo quarto dia é um convite à tua curiosidade. Formula uma pergunta relevante sobre os conteúdos que tens estudado durante a semana e dedica tempo a conhecer a sua resposta. Podes optar por pesquisar autonomamente ou perguntar a um Professor ou colega."
    },
    {
        id: 35,
        title: "Cronometrado",
        description: "Sabes quanto tempo demoras a ler um artigo ou a resolver um exercício? Hoje o desafio é tornares-te mais consciente sobre como utilizas o teu tempo. Escolhe uma tarefa que precises de completar e liga o cronómetro. Durante a realização monitoriza quanto estás a avançar durante o tempo cronometrado e, no fim, reflete sobre a tua prestação. Pergunta-te: “faz-me sentido este tempo?”, “o que consegui concluir?”, “consigo fazer em menos tempo?”."
    },
    {
        id: 36,
        title: "Mapa do Futuro",
        description: "Hoje o desafio é mapear o conhecimento. Escolhe um exame de um ano anterior ou uma lista de exercícios e dedica tempo a analisar o seu conteúdo. Os exercícios que apliquem matéria dada resolve sem consultar anotações e, no final, regista as questões que erraste ou que achaste mais desafiantes, para avaliares o teu domínio da matéria. Caso te depares com matéria que ainda não deste, não ignores! Usa essas questões para teres uma ideia dos tópicos que ainda vais estudar e começa a familiarizar-te com a sua forma de avaliação. Vais ver que assim vais desconstruindo o “bicho de sete cabeças” que te parecem as avaliações."
    },
    {
        id: 37,
        title: "Crescer e Aprender",
        description: "No décimo sétimo dia o desafio é melhorar. Pensa numa habilidade / competência em que não és tão bom ou que gostarias de aprimorar. Pode ser algo relacionado com o estudo (e.g., escrita, pesquisa) ou mais pessoal (e.g., gestão de tempo, comunicação). O importante é criares um plano para a desenvolveres. Pensa nos recursos que tens à tua disposição: um curso, um livro, a ajuda de um colega… tudo vale!"
    },
    {
        id: 38,
        title: "Abraçar o Conhecimento",
        description: "Hoje o desafio é escolheres um workshop, palestra ou webinar para assistir sobre um tema que complete, mas não faça parte do currículo principal do teu curso. Isso vai ajudar-te a expandir o teu conhecimento e a desenvolver uma perspetiva mais ampla sobre a tua área. Ao investires neste tipo de iniciativa, estás não só a enriquecer as tuas competências, como a demonstrar iniciativa e a diferenciar o teu perfil profissional dos demais."
    },
    {
        id: 39,
        title: "(Des)conhecido",
        description: "No décimo nono dia o desafio é simular. Imagina que és Professor de uma das tuas unidades curriculares. Elabora um exame, tendo por base a tua revisão dos conteúdos. Prepara-te para o desconhecido, pensando no que será mais provável sair, tipo de pergunta… isso vai ajudar-te a identificar áreas que precisam de maior revisão e a preparar avaliações reais. Ah, não te esqueças de tirar um tempinho da tua semana para resolveres esse exame!"
    },
    {
        id: 40,
        title: "Ritual",
        description: "Hoje o desafio é estabeleceres uma rotina antes de ires dormir. Evita o uso de dispositivos tecnológicos pelo menos uma hora antes da tua hora de deitar. Em vez disso, cria um ritual que inclua uma leitura leve, meditação, banho quente, ouvir música … Vais ver como vais sentir a qualidade do teu sono a melhorar. Antes de te afastares do telemóvel, não te esqueças de ativar o “modo não incomodar”."
    },
    {
        id: 41,
        title: "A Carta",
        description: "Acreditaste nestes 21 dias e fizeste acontecer. Agora, é hora de refletires sobre este percurso, celebrando as conquistas e traçando novos objetivos. O que levas deste desafio? Escreve “uma carta” para o teu eu do futuro e diz-lhe como gostarias de ser como estudante: quais os teus objetivos / ambições e como planeias alcançá-los. Escreve o teu compromisso contigo. Escreve esta carta no local mais fácil para ti. O bloco de notas do telemóvel também conta!"
    }
];

function level2Challenges(startDate: Date): DayChallenges[] {
    return commons.getDayChallenges(level2StaticChallenge, startDate, 2);
}

function getLevel2ChallengeList(): Challenge[] {
    return level2StaticChallenge;
}

export const Level2 = {
    level2Challenges,
    getLevel2ChallengeList
};
