import React, { useEffect, useState } from "react";
import Joyride, {
    ACTIONS,
    CallBackProps,
    EVENTS,
    STATUS,
    Step,
} from "react-joyride";
import { useLocation } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";

const TUTORIAL_STEPS = {
    // Passos para a página do Calendário (Home do Challenge)
    calendar_page: [
        {
            target: "body",
            placement: "center" as const,
            content: (
                <div style={{ textAlign: "center" }}>
                    <h3>Bem-vindo ao Desafio Académico! 🚀</h3>
                    <p>
                        Aqui é onde a consistência encontra a recompensa.
                        Completa os teus objetivos diários para ganhares
                        medalhas.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: ".tutorial-target-calendar-grid",
            content:
                "Este é o teu mapa de batalha. Os dias a verde são vitórias, os dias a vermelho são oportunidades de melhoria.",
            placement: "bottom" as const,
        },
        {
            target: ".tutorial-target-day-info",
            content:
                "Clica num dia para veres os detalhes. Aqui verás o que precisas de fazer (ou o que já conquistaste) nesse dia.",
            placement: "left" as const,
        },
    ],

    // Passos para a página de Medalhas (Gamification)
    badges_page: [
        {
            target: ".tutorial-target-badges-header",
            content: (
                <div>
                    <h3>Hall da Fama 🏆</h3>
                    <p>
                        Aqui visualizas a tua evolução nas Ligas e as Medalhas
                        que já ganhaste.
                    </p>
                </div>
            ),
            disableBeacon: true,
            placement: "bottom" as const,
        },
        {
            target: ".tutorial-target-level-container", // Aponta para o primeiro nível visível
            content:
                "O sistema divide-se em Níveis (ou Ligas). Precisas de completar desafios para desbloquear o próximo nível.",
            placement: "top" as const,
        },
        {
            target: ".tutorial-target-badge-item", // Aponta para a primeira medalha
            content:
                "Cada ícone é uma medalha. As coloridas já são tuas! As cinzentas... bem, ainda tens de as ganhar!",
        },
    ],
};

interface ChallengeTutorialProps {
    user: UserInfo | null;
    refreshUser: () => void;
}

export function ChallengeTutorial({
    user,
    refreshUser,
}: ChallengeTutorialProps) {
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);
    const [tutorialKey, setTutorialKey] = useState("");
    const location = useLocation();

    useEffect(() => {
        if (!user) return;

        // Lista de tutoriais já vistos pelo user
        const seen = user.tutorial_progress || [];
        let stepsToRun: Step[] = [];
        let key = "";

        if (
            location.pathname.includes("/calendar") &&
            !seen.includes("challenge_calendar")
        ) {
            stepsToRun = TUTORIAL_STEPS.calendar_page;
            key = "challenge_calendar";
        } else if (
            location.pathname.includes("/badges") &&
            !seen.includes("challenge_badges")
        ) {
            stepsToRun = TUTORIAL_STEPS.badges_page;
            key = "challenge_badges";
        }

        // Se encontrou um tutorial novo para mostrar
        if (key && key !== tutorialKey) {
            setSteps(stepsToRun);
            setTutorialKey(key);
            setTimeout(() => setRun(true), 1000);
        }
    }, [user, location.pathname, tutorialKey]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false);
            if (tutorialKey) {
                if (service.markTutorialAsSeen) {
                    await service.markTutorialAsSeen(tutorialKey);
                    refreshUser();
                } else {
                    console.warn(
                        "Service method markTutorialAsSeen not implemented yet",
                    );
                }
            }
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            callback={handleJoyrideCallback}
            disableScrollParentFix={true}
            floaterProps={{ disableAnimation: true }}
            styles={{
                options: {
                    primaryColor: "#7e22ce",
                    zIndex: 100000,
                },
                tooltipContainer: {
                    textAlign: "left",
                },
                buttonNext: {
                    backgroundColor: "#7e22ce",
                },
                buttonBack: {
                    color: "#7e22ce",
                },
            }}
            locale={{
                back: "Anterior",
                close: "Fechar",
                last: "Vamos lá!",
                next: "Próximo",
                skip: "Saltar",
            }}
        />
    );
}
