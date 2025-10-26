import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import styles from "./studyPage.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

const MENU_ITEMS = [
  {
    name: "pomodoro",
    path: "/pomodoro",
    icon: "icons/study_icon.png",
  },
  {
    name: "notes",
    path: "/curricular-units",
    icon: "icons/tasks_icon.png",
  },
  {
    name: "notebooks",
    path: "/archives",
    icon: "icons/notes_icon.png",
  },
];

// Carrega os namespaces de tradução necessários
export let handle = {
  i18n: ["navigation"],
};

function StudyPage() {
  const { t } = useTranslation("navigation");

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{t("study")}</h1>
      <p className={styles.subtitle}>
        {t(
          "study_subtitle",
          "Escolhe uma ferramenta para te ajudar a estudar."
        )}
      </p>
      <div className={styles.menuGrid}>
        {MENU_ITEMS.map((item) => (
          <Link key={item.name} to={item.path} className={styles.menuButton}>
            <img src={item.icon} alt="" className={styles.menuIcon} />
            {/* O 't(item.name)' vai procurar por "pomodoro", "notes", etc. */}
            <span className={styles.menuText}>{t(item.name)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function StudyPageAuthControlled() {
  return (
    <RequireAuthn>
      <StudyPage />
    </RequireAuthn>
  );
}
