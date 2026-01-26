import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTranslation } from "react-i18next";

interface TutorialTourProps {
  steps: Step[];
  tutorialKey: string;
}

export function TutorialTour({ steps, tutorialKey }: TutorialTourProps) {
  const [run, setRun] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    // Verifica se o utilizador já completou este tutorial específico
    const viewed = localStorage.getItem(`tutorial_viewed_${tutorialKey}`);

    // Se ainda não viu, arranca o tutorial
    if (!viewed) {
      setRun(true);
    }
  }, [tutorialKey]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      // Quando termina ou salta, marca como visto para sempre
      localStorage.setItem(`tutorial_viewed_${tutorialKey}`, "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      locale={{
        back: "Anterior",
        close: "Fechar",
        last: "Vamos a isso! 🚀",
        next: "Próximo",
        skip: "Saltar Tutorial",
      }}
      styles={{
        options: {
          arrowColor: "#fff",
          backgroundColor: "#fff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: "var(--color-2)",
          textColor: "#333",
          zIndex: 10000, // Ficar por cima de tudo
        },
        buttonNext: {
          backgroundColor: "var(--color-2)",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "8px",
        },
        buttonBack: {
          color: "var(--color-2)",
          marginRight: 10,
        },
      }}
    />
  );
}
