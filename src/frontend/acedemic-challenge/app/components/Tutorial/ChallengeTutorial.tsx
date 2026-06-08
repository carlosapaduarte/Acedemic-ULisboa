import React, { useEffect, useState, useMemo } from "react";
import Joyride, {
    ACTIONS,
    CallBackProps,
    EVENTS,
    STATUS,
    Step,
} from "react-joyride";
import { useLocation } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";
import { useTranslation } from "react-i18next";

interface ChallengeTutorialProps {
    user: UserInfo | null;
    refreshUser: () => void;
}

export function ChallengeTutorial({
    user,
    refreshUser,
}: ChallengeTutorialProps) {
    const { t } = useTranslation(["tutorial"]);
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);
    const [tutorialKey, setTutorialKey] = useState("");
    const location = useLocation();

    const TUTORIAL_STEPS = useMemo(() => ({
        calendar_page: [
            {
                target: "body",
                placement: "center" as const,
                content: (
                    <div style={{ textAlign: "center" }}>
                        <h3>{t("tutorial:calendar_step1_title", "Bem-vindo ao Desafio Académico! 🚀")}</h3>
                        <p>
                            {t("tutorial:calendar_step1_desc", "Aqui é onde a consistência encontra a recompensa. Completa os teus objetivos diários para ganhares medalhas.")}
                        </p>
                    </div>
                ),
                disableBeacon: true,
            },
            {
                target: ".tutorial-target-calendar-grid",
                content: t("tutorial:calendar_step2", "Este é o teu mapa de batalha. Os dias a verde são vitórias, os dias a vermelho são oportunidades de melhoria."),
                placement: "bottom" as const,
            },
            {
                target: ".tutorial-target-day-info",
                content: t("tutorial:calendar_step3", "Clica num dia para veres os detalhes. Aqui verás o que precisas de fazer (ou o que já conquistaste) nesse dia."),
                placement: "left" as const,
            },
        ],
        badges_page: [
            {
                target: ".tutorial-target-badges-header",
                content: (
                    <div>
                        <h3>{t("tutorial:badges_step1_title", "Hall da Fama 🏆")}</h3>
                        <p>
                            {t("tutorial:badges_step1_desc", "Aqui visualizas a tua evolução nas Ligas e as Medalhas que já ganhaste.")}
                        </p>
                    </div>
                ),
                disableBeacon: true,
                placement: "bottom" as const,
            },
            {
                target: ".tutorial-target-level-container",
                content: t("tutorial:badges_step2", "O sistema divide-se em Níveis (ou Ligas). Precisas de completar desafios para desbloquear o próximo nível."),
                placement: "top" as const,
            },
            {
                target: ".tutorial-target-badge-item",
                content: t("tutorial:badges_step3", "Cada ícone é uma medalha. As coloridas já são tuas! As cinzentas... bem, ainda tens de as ganhar!"),
            },
        ],
    }), [t]);

    useEffect(() => {
        if (!user) return;

        // Lista de tutoriais já vistos pelo user
        const seen = user.tutorial_progress || [];
        let stepsToRun: Step[] = [];
        let key = "";

        if (location.pathname.includes("/calendar") && !seen.includes("challenge_calendar")) {
            stepsToRun = TUTORIAL_STEPS.calendar_page;
            key = "challenge_calendar";
        } else if (location.pathname.includes("/badges") && !seen.includes("challenge_badges")) {
            stepsToRun = TUTORIAL_STEPS.badges_page;
            key = "challenge_badges";
        }

        // Se encontrou um tutorial novo para mostrar
        if (key && key !== tutorialKey) {
            setSteps(stepsToRun);
            setTutorialKey(key);
            setTimeout(() => setRun(true), 1000);
        }
    }, [user, location.pathname, tutorialKey, TUTORIAL_STEPS]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false);
            if (tutorialKey) {
                if (service.markTutorialAsSeen) {
                    await service.markTutorialAsSeen(tutorialKey);
                    refreshUser();
                } else {
                    console.warn("Service method markTutorialAsSeen not implemented yet");
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
                tooltipContainer: { textAlign: "left" },
                buttonNext: { backgroundColor: "#7e22ce" },
                buttonBack: { color: "#7e22ce" },
            }}
            locale={{
                back: t("tutorial:back", "Anterior"),
                close: t("tutorial:close", "Fechar"),
                last: t("tutorial:last", "Vamos lá!"),
                next: t("tutorial:next", "Próximo"),
                skip: t("tutorial:skip", "Saltar"),
            }}
        />
    );
}