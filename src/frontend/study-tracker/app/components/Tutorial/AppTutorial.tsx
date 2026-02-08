import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from "react-joyride";
import { useLocation } from "@remix-run/react";
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
        "Esta é a tua Zona de Foco. Aqui ativas o cronómetro Pomodoro e geres os teus apontamentos.",
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

  calendar_page: [
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
      placement: "auto" as const,
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-calendar-create",
      content: "Vamos criar um evento. Clica aqui!",
      spotlightClicks: true,
      hideFooter: true,
      disableOverlayClose: true,
      placement: "bottom" as const,
    },
    // DENTRO DO MODAL
    {
      target: ".tutorial-target-event-modal-window",
      content: (
        <div style={{ textAlign: "center" }}>
          <strong>Passo 1: Título 📝</strong>
          <p>Escreve um nome para o teu evento.</p>
          <p>
            <i>(O tutorial avança quando escreveres...)</i>
          </p>
        </div>
      ),
      disableOverlay: true,
      placement: "right" as const,
      hideFooter: true,
    },
    {
      target: ".tutorial-target-event-modal-window",
      content: (
        <div style={{ textAlign: "left" }}>
          <strong>Detalhes do Evento ⚙️</strong>
          <p>
            Aqui podes editar os <b>dias, horários</b>, adicionar <b>notas</b> e
            definir a <b>recorrência</b>.
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-event-modal-window",
      content: (
        <div style={{ textAlign: "left" }}>
          <strong>Personalização 🎨</strong>
          <p>
            Escolhe uma cor. Carrega no <b>+</b> para guardar favoritas!
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-event-modal-window",
      content: (
        <div style={{ textAlign: "left" }}>
          <strong>Etiquetas (Tags) 🏷️</strong>
          <p>Organiza o evento por categorias (Gerais ou UCs).</p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: ".tutorial-target-event-save",
      content: "Grava o teu evento!",
      disableOverlay: true,
      hideFooter: true,
      placement: "top" as const,
    },
    {
      target: ".rbc-event",
      content: "Feito! Clica no evento para veres detalhes.",
      placement: "auto" as const,
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
      target: ".tutorial-target-stats-energy",
      content:
        "O Gráfico de Energia mostra a tua evolução baseada nos registos do Mood Tracker.",
      title: "Vitalidade",
      disableBeacon: true,
    },
    {
      target: ".tutorial-target-stats-focus",
      content: "Aqui vês quantos minutos de Foco (Pomodoro) fizeste por dia.",
      title: "Produtividade",
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
      target: ".tutorial-target-uc-card", // Aponta para o primeiro cartão se existir
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

  useEffect(() => {
    if (!user) return;
    const seen = user.tutorial_progress || [];
    let stepsToRun: Step[] = [];
    let key = "";

    if (location.pathname === "/" && !seen.includes("onboarding_general")) {
      stepsToRun = TUTORIAL_STEPS.general;
      key = "onboarding_general";
    } else if (
      location.pathname.includes("/calendar") &&
      !seen.includes("page_calendar")
    ) {
      stepsToRun = TUTORIAL_STEPS.calendar_page;
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
  }, [user, location.pathname]);

  // Watcher Modal Open (Calendar)
  useEffect(() => {
    if (!run || tutorialKey !== "page_calendar") return;
    if (stepIndex === 1) {
      const check = setInterval(() => {
        const modal = document.querySelector(
          ".tutorial-target-event-modal-window",
        );
        if (modal) {
          clearInterval(check);
          setStepIndex((p) => p + 1);
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, [stepIndex, run, tutorialKey]);

  // Watcher Modal Close (Calendar)
  useEffect(() => {
    if (!run || tutorialKey !== "page_calendar") return;
    if (stepIndex === 6) {
      const check = setInterval(() => {
        const modal = document.querySelector(
          ".tutorial-target-event-modal-window",
        );
        if (!modal) {
          clearInterval(check);
          setStepIndex((p) => p + 1);
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, [stepIndex, run, tutorialKey]);

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

  // Watcher Title Input (Calendar)
  useEffect(() => {
    if (!run || tutorialKey !== "page_calendar") return;
    if (stepIndex === 2) {
      const check = setInterval(() => {
        const titleInput = document.querySelector(
          ".tutorial-target-event-title",
        ) as HTMLInputElement;
        if (titleInput && titleInput.value && titleInput.value.length > 2) {
          clearInterval(check);
          setTimeout(() => setStepIndex((p) => p + 1), 1000);
        }
      }, 500);
      return () => clearInterval(check);
    }
  }, [stepIndex, run, tutorialKey]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type, index } = data;

    // Scroll Logic para o Calendário
    if (
      tutorialKey === "page_calendar" &&
      type === EVENTS.STEP_AFTER &&
      action === ACTIONS.NEXT
    ) {
      if (index === 2)
        document
          .getElementById("tutorial-scroll-dates")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (index === 3)
        document
          .getElementById("tutorial-scroll-customization")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (index === 4)
        document
          .getElementById("tutorial-scroll-tags")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (index === 5)
        document
          .querySelector(".tutorial-target-event-save")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

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
