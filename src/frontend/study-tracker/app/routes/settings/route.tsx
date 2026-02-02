import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";
import { ThemeContext } from "~/components/Theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import styles from "./settings.module.css";
import {
  RiSave3Fill,
  RiArrowLeftLine,
  RiRestartLine,
  RiCheckLine,
} from "react-icons/ri";

function createAvatars(): string[] {
  const avatars: string[] = [];
  for (let u = 0; u < 30; u++) {
    avatars.push(`./avatars/avatar${u % 12}.png`);
  }
  return avatars;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);
  const { theme, setTheme } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Form States
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(-1);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [goalHours, setGoalHours] = useState(0);

  // Dark Mode Logic
  const isDarkMode = theme === "black";
  const handleThemeToggle = () => {
    setTheme(isDarkMode ? "purple" : "black");
  };

  // Load Data
  useEffect(() => {
    const loadedAvatars = createAvatars();
    setAvatars(loadedAvatars);

    service
      .fetchUserInfoFromApi()
      .then((data) => {
        setUser(data);

        // Definir meta de horas
        const currentGoal =
          data.use_goals && data.use_goals.length > 0 ? data.use_goals[0] : 2;
        setGoalHours(currentGoal);

        // Tentar encontrar o índice do avatar atual
        const currentAvatarIndex = loadedAvatars.findIndex((a) =>
          a.includes(data.avatarFilename),
        );
        setSelectedAvatarIndex(
          currentAvatarIndex !== -1 ? currentAvatarIndex : 0,
        );
      })
      .catch((err) => console.error("Erro ao carregar settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const promises = [];

      // 1. Update Avatar
      const newAvatarFullString = avatars[selectedAvatarIndex];
      if (
        newAvatarFullString &&
        !newAvatarFullString.includes(user.avatarFilename)
      ) {
        const filename =
          newAvatarFullString.split("/").pop() || newAvatarFullString;
        promises.push(service.selectAvatar(filename));
      }

      // 2. Update Goals
      /*
            const goalsSet = new Set<number>();
            goalsSet.add(Number(goalHours));
            promises.push(service.updateAppUseGoals(goalsSet));
            */

      if (promises.length > 0) {
        await Promise.all(promises);

        // Atualizar o estado local do user para refletir a mudança sem refresh
        setUser({
          ...user,
          avatarFilename:
            newAvatarFullString.split("/").pop() || user.avatarFilename,
        });
      }

      // Feedback visual de sucesso sem refresh
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Remove msg após 3s
    } catch (error: any) {
      alert(`Erro ao guardar: ${error.message || "Verifica a consola."}`);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetTutorial = () => {
    if (confirm("Tens a certeza que queres repetir o tutorial?")) {
      localStorage.removeItem("tutorial_completed");
      sessionStorage.removeItem("tutorial_completed");
      window.location.reload();
    }
  };

  if (loading)
    return <div className={styles.container}>A carregar definições...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Definições</h1>
      </div>

      <div className={styles.content}>
        {/* PERFIL (Read Only) */}
        <section className={styles.section}>
          <h2>Perfil</h2>
          <div className={styles.infoRow}>
            <span className={styles.label}>Nome de Utilizador:</span>
            <span className={styles.value}>{user?.username}</span>
          </div>
        </section>

        {/* AVATAR SELECTION */}
        <section className={styles.section}>
          <h2>Avatar</h2>
          <div className={styles.avatarGrid}>
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`${styles.avatarItem} ${
                  selectedAvatarIndex === index ? styles.avatarSelected : ""
                }`}
                onClick={() => setSelectedAvatarIndex(index)}
              >
                <img src={avatar} alt={`Avatar ${index}`} />
              </div>
            ))}
          </div>
        </section>

        {/* APARÊNCIA (Toggle) */}
        <section className={styles.section}>
          <div className={styles.toggleRow}>
            <div>
              <h2>Modo Noturno</h2>
              <p className={styles.description}>
                Alternar entre tema claro e escuro
              </p>
            </div>

            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={handleThemeToggle}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </section>

        {/* OBJETIVOS */}
        <section className={styles.section}>
          <h2>Objetivos</h2>
          <div className={styles.formGroup}>
            <label>Meta de Estudo Diário (Horas)</label>
            <input
              type="number"
              min="0"
              max="24"
              value={goalHours}
              onChange={(e) => setGoalHours(Number(e.target.value))}
              className={styles.input}
              style={{ width: "100px" }}
            />
          </div>
        </section>

        {/* SISTEMA */}
        <section className={styles.section}>
          <h2>Sistema</h2>
          <button onClick={handleResetTutorial} className={styles.dangerButton}>
            <RiRestartLine /> Repetir Tutorial Global
          </button>
        </section>

        {/* ACTION BAR */}
        <div className={styles.actionBar}>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${styles.saveButton} ${
              saveSuccess ? styles.success : ""
            }`}
          >
            {saving ? (
              "A guardar..."
            ) : saveSuccess ? (
              <>
                <RiCheckLine /> Guardado!
              </>
            ) : (
              <>
                <RiSave3Fill /> Guardar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
