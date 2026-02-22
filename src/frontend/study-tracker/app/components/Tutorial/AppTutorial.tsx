import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from "react-joyride";
import { useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { service, UserInfo } from "~/service/service";

const TUTORIAL_STEPS = {
  general: [
    {
      target: "body",
      placement: "center" as const,
      content: (
        <div>
          <h3>Bem-vindo ao Acedemic Tracker! 🎓</h3>
          <p>
            Esta aplicação vai ajudar-te a organizar o teu estudo e a manter o
            foco.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-dashboard-container",
      content:
        "Este é o teu Dashboard. O teu ponto de partida para veres o resumo do dia.",
      placement: "bottom" as const,
    },
    {
      target: ".tutorial-target-mood-tracker",
      content:
        "Monitoriza a tua energia! Usa isto diariamente para perceberes padrões de foco.",
    },
    {
      target: ".tutorial-target-hamburger",
      content: (
        <div>
          <strong>Menu de Navegação</strong>
          <p>Clica aqui para abrir o menu e continuar.</p>
        </div>
      ),
      spotlightClicks: true,
      hideFooter: true,
      placement: "right" as const,
      disableOverlayClose: true,
    },
    {
      target: ".tutorial-target-nav-calendar",
      content: "No Calendário visualizas e crias os teus eventos.",
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-nav-tasks",
      content:
        "A tua lista de afazeres. Cria tarefas, define prioridades e nunca falhas um prazo.",
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-nav-study",
      content:
        "Esta é a tua Zona de Estudo. Aqui ativas o cronómetro Pomodoro, geres os teus apontamentos e Unidades Curriculares.",
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-nav-statistics",
      content:
        "Analisa a tua performance. Vê gráficos sobre o teu foco, energia e tarefas concluídas.",
      placement: "right" as const,
    },
    {
      target: "body",
      placement: "center" as const,
      content: "Estás pronto! Explora a app ao teu ritmo.",
    },
  ],

  tasks_page: [
    {
      target: ".tutorial-target-tasks-header",
      content:
        "Bem-vindo às tuas Tarefas! Aqui geres TPCs, projetos e entregas.",
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-tasks-list",
      content:
        "Aqui aparecem as tuas tarefas. Podes organizá-las e marcar como concluídas.",
    },
  ],

  statistics_page: [
    {
      target: "body",
      placement: "center" as const,
      content: (
        <div style={{ textAlign: "center" }}>
          <strong>As tuas Estatísticas 📊</strong>
          <p>
            Vamos fazer uma visita rápida para entenderes os teus resultados.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-stats-summary",
      placement: "bottom" as const,
      content:
        "Aqui no topo tens um resumo rápido da semana: tempo de foco total, tarefas concluídas e apontamentos.",
    },
    {
      target: ".tutorial-target-stats-energy",
      placement: "top" as const,
      content:
        "A tua Vitalidade ⚡: Vê como a tua energia flutua ao longo dos dias, baseado no teu Mood Tracker.",
    },
    {
      target: ".tutorial-target-stats-tasks",
      placement: "top" as const,
      content:
        "O teu Trabalho ✅: Analisa rapidamente o volume de tarefas feitas em comparação com as que ainda faltam.",
    },
    {
      target: ".tutorial-target-stats-focus",
      placement: "top" as const,
      content:
        "Performance Pomodoro ⏱️: Descobre os teus padrões de foco, a tua média de tempo e as interrupções.",
    },
    {
      target: ".tutorial-target-stats-drilldown",
      placement: "top" as const,
      content:
        "Análise Detalhada 🔍: Por fim, usa esta zona para explorares dados mais específicos do teu histórico. Estás pronto!",
    },
  ],

  pomodoro_page: [
    {
      target: ".tutorial-target-pomodoro-timer",
      content:
        "Este é o teu temporizador. O método Pomodoro ajuda-te a estudar em blocos de foco intenso.",
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-pomodoro-settings",
      content: "Podes personalizar os tempos de Foco e Pausa aqui.",
    },
    {
      target: ".tutorial-target-pomodoro-tasks",
      content:
        "Seleciona uma tarefa da lista para te focares nela durante este bloco.",
    },
    {
      target: ".tutorial-target-pomodoro-start",
      content: "Quando estiveres pronto, carrega em Iniciar!",
    },
  ],

  notes_page: [
    {
      target: ".tutorial-target-notes-create",
      content: "Clica aqui para carregar um novo documento ou criar uma nota.",
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-notes-list",
      content: "Aqui ficam guardados todos os teus ficheiros.",
    },
    {
      target: ".tutorial-target-notes-search",
      content: "Usa a pesquisa para encontrares rapidamente matérias antigas.",
    },
  ],

  curricular_units_page: [
    {
      target: ".tutorial-target-uc-header",
      content:
        "Aqui geres as tuas Cadeiras/Disciplinas e simulas as tuas notas.",
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-uc-create",
      content: "Adiciona uma nova Unidade Curricular e define os seus ECTS.",
    },
    {
      target: ".tutorial-target-uc-card",
      content: (
        <div>
          <strong>Simulador de Notas 📊</strong>
          <p>
            Dentro de cada cartão, podes adicionar as avaliações (testes,
            trabalhos) e os seus pesos.
          </p>
          <p>
            A barra mostra-te quanto já garantiste e quanto ainda podes
            alcançar.
          </p>
        </div>
      ),
    },
  ],
};

interface AppTutorialProps {
  user: UserInfo | null;
  refreshUser: () => void;
}

export function AppTutorial({ user, refreshUser }: AppTutorialProps) {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tutorialKey, setTutorialKey] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();

  // 1. Hook chamado de forma correta (apenas uma vez e fora do useEffect)
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!user) return;
    const seen = user.tutorial_progress || [];
    let stepsToRun: Step[] = [];
    let key = "";

    const isPT = i18n.language ? i18n.language.startsWith("pt") : true;

    const image1 = isPT
      ? "/tracker/tutorial/tutorial-evento-1-pt.png"
      : "/tracker/tutorial/tutorial-evento-1-en.png";
    const image2 = isPT
      ? "/tracker/tutorial/tutorial-evento-2-pt.png"
      : "/tracker/tutorial/tutorial-evento-2-en.png";

    const dynamicCalendarSteps: Step[] = [
      {
        target: ".rbc-calendar",
        content: (
          <div>
            <strong>Calendário 📅</strong>
            <p>
              Para criares um evento, podes clicar no botão "Criar" ou arrastar
              diretamente na grelha.
            </p>
          </div>
        ),
        placement: "auto",
        disableBeacon: true,
      },
      {
        target: "body",
        placement: "center",
        content: (
          <div style={{ textAlign: "center", maxWidth: "800px" }}>
            <strong>O Formulário: Datas e Detalhes 📝</strong>
            <img
              src={image1}
              alt="Topo do Formulário"
              style={{
                width: "100%",
                borderRadius: "8px",
                margin: "15px 0",
              }}
            />
          </div>
        ),
      },
      {
        target: "body",
        placement: "center",
        content: (
          <div style={{ textAlign: "center", maxWidth: "800px" }}>
            <strong>O Formulário: Personalização e Etiquetas 🎨</strong>
            <img
              src={image2}
              alt="Fundo do Formulário"
              style={{
                width: "100%",
                borderRadius: "8px",
                margin: "15px 0",
              }}
            />
          </div>
        ),
      },
      {
        target: ".tutorial-target-calendar-create",
        content: (
          <div>
            <strong>Agora é a tua vez! 🚀</strong>
            <p>
              Clica em "Criar" (ou arrasta no calendário) e faz um evento de
              teste. O tutorial fica por aqui, explora à vontade!
            </p>
          </div>
        ),
        placement: "bottom",
      },
    ];

    // 5. Lógica de Roteamento
    if (location.pathname === "/" && !seen.includes("onboarding_general")) {
      stepsToRun = TUTORIAL_STEPS.general;
      key = "onboarding_general";
    } else if (
      location.pathname.includes("/calendar") &&
      !seen.includes("page_calendar")
    ) {
      stepsToRun = dynamicCalendarSteps;
      key = "page_calendar";
    } else if (
      location.pathname.includes("/statistics") &&
      !seen.includes("page_statistics")
    ) {
      stepsToRun = TUTORIAL_STEPS.statistics_page;
      key = "page_statistics";
    } else if (
      location.pathname.includes("/pomodoro") &&
      !seen.includes("page_pomodoro")
    ) {
      stepsToRun = TUTORIAL_STEPS.pomodoro_page;
      key = "page_pomodoro";
    } else if (
      location.pathname.includes("/tasks") &&
      !seen.includes("page_tasks")
    ) {
      stepsToRun = TUTORIAL_STEPS.tasks_page;
      key = "page_tasks";
    } else if (
      location.pathname.includes("/notes") &&
      !seen.includes("page_notes")
    ) {
      stepsToRun = TUTORIAL_STEPS.notes_page;
      key = "page_notes";
    } else if (
      location.pathname.includes("/curricular-units") &&
      !seen.includes("page_curricular_units")
    ) {
      stepsToRun = TUTORIAL_STEPS.curricular_units_page;
      key = "page_curricular_units";
    }

    if (key && key !== tutorialKey) {
      setSteps(stepsToRun);
      setTutorialKey(key);
      setStepIndex(0);
      setTimeout(() => setRun(true), 500);
    }
  }, [user, location.pathname, i18n.language, tutorialKey]);

  // Watcher Hamburguer (General)
  useEffect(() => {
    if (!run || tutorialKey !== "onboarding_general") return;
    if (stepIndex === 3) {
      const check = setInterval(() => {
        const sidebar = document.querySelector('div[data-expanded="true"]');
        if (sidebar) {
          clearInterval(check);
          setTimeout(() => setStepIndex((prev) => prev + 1), 300);
        }
      }, 500);
      return () => clearInterval(check);
    }
  }, [stepIndex, run, tutorialKey]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type, index } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      if (tutorialKey) {
        await service.markTutorialAsSeen(tutorialKey);
        refreshUser();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      disableScrollParentFix
      floaterProps={{ disableAnimation: true }}
      styles={{
        options: {
          primaryColor: "#0066cc",
          zIndex: 100000,
          width: "min(70vw, 650px)",
        },
        spotlight: {
          borderRadius: 16,
        },
      }}
      locale={{
        back: "Anterior",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        skip: "Saltar",
      }}
    />
  );
}
