import React, { useEffect, useState } from "react";
import { service, UserInfo } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./settingsPage.module.css";
import classNames from "classnames";
import { RiSave3Fill, RiCheckLine, RiMoonClearFill } from "react-icons/ri";

const CHALLENGE_LEVELS = [
  { id: 1, labelKey: "level_beginner" },
  { id: 2, labelKey: "level_intermediate" },
  { id: 3, labelKey: "level_advanced" },
] as const;

/**
 * DOCUMENTAÇÃO: Gera a lista de caminhos para os avatares disponíveis.
 */
function createAvatars(): string[] {
  const avatars: string[] = [];
  for (let u = 0; u < 12; u++) {
    avatars.push(`./avatars/avatar${u}.png`);
  }
  return avatars;
}

export default function SettingsPage() {
  const { t } = useTranslation(["common", "settings"]);

  // ESTADOS DO FORMULÁRIO
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [displayName, setDisplayName] = useState<string>("");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(-1);
  const [avatars, setAvatars] = useState<string[]>([]);

  /**
   * ETAPA: Carregamento inicial de dados da API.
   */
  useEffect(() => {
    const loadedAvatars = createAvatars();
    setAvatars(loadedAvatars);

    service
      .fetchUserInfoFromApi()
      .then((data) => {
        setUser(data);
        setDisplayName(data.displayName || data.username || "");

        const currentAvatarIndex = loadedAvatars.findIndex((a) =>
          a.includes(data.avatarFilename),
        );
        setSelectedAvatarIndex(currentAvatarIndex !== -1 ? currentAvatarIndex : 0);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  /**
   * ETAPA: Lógica para persistir as alterações no servidor.
   */
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const promises = [];

      const newAvatarFullString = avatars[selectedAvatarIndex];
      if (newAvatarFullString && !newAvatarFullString.includes(user.avatarFilename)) {
        const filename = newAvatarFullString.split("/").pop() || newAvatarFullString;
        promises.push(service.selectAvatar(filename));
      }

      promises.push(service.updateDisplayName(displayName));

      if (promises.length > 0) {
        await Promise.all(promises);
        setUser({
          ...user,
          avatarFilename: newAvatarFullString?.split("/").pop() || user.avatarFilename,
          displayName: displayName,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("settings:save_error_unknown");
      alert(t("settings:save_error", { message }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>{t("common:loading")}</div>
    );
  }

  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.settingTitle}>{t("settings:title")}</h1>

      <div className={styles.sectionsWrapper}>

        {/* SECÇÃO: PERFIL DO ALUNO */}
        <section className={styles.sectionCard}>
          <h2 className={styles.cardTitle}>{t("settings:profile_title")}</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t("settings:name_label")}</label>
            <input
              type="text"
              className={styles.nameInput}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.label}>{t("settings:id_label")}</span>
            <span className={styles.readOnlyValue}>{user?.username}</span>
          </div>
        </section>

        {/* SECÇÃO: NÍVEL DO DESAFIO (FUNCIONALIDADE FUTURA) */}
        <section className={classNames(styles.sectionCard, styles.disabledSection)}>
          <div className={styles.cardHeaderWithBadge}>
            <h2 className={styles.cardTitle}>{t("settings:challenge_level_title")}</h2>
            <span className={styles.comingSoonBadge}>{t("settings:coming_soon")}</span>
          </div>
          <p className={styles.description}>{t("settings:challenge_level_description")}</p>

          <div className={styles.levelButtonGroup}>
            {CHALLENGE_LEVELS.map((level) => {
              const isSelected = user?.currentChallengeLevel === level.id;
              return (
                <button
                  key={level.id}
                  disabled
                  className={classNames(styles.levelBtn, isSelected && styles.levelBtnSelected)}
                >
                  {t(`settings:${level.labelKey}`)}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECÇÃO: SELEÇÃO DE AVATAR */}
        <section className={styles.sectionCard}>
          <h2 className={styles.cardTitle}>{t("settings:avatar_title")}</h2>
          <div className={styles.avatarGrid}>
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={classNames(styles.avatarItem, selectedAvatarIndex === index && styles.avatarSelected)}
                onClick={() => setSelectedAvatarIndex(index)}
              >
                <img src={avatar} alt={`avatar-${index}`} className={styles.avatarImg} />
              </div>
            ))}
          </div>
        </section>

        {/* SECÇÃO: MODO NOTURNO (VISUAL) */}
        <section className={styles.sectionCard}>
          <div className={styles.cardHeaderWithBadge}>
            <h2 className={styles.cardTitle}>
              <RiMoonClearFill /> {t("settings:dark_mode_title")}
            </h2>
            <span className={styles.comingSoonBadge}>{t("settings:coming_soon_short")}</span>
          </div>
          <div className={styles.systemRow}>
            <p className={styles.description}>{t("settings:dark_mode_description")}</p>
            <label className={styles.switchDisabled}>
              <span className={styles.slider}></span>
            </label>
          </div>
        </section>

      </div>

      {/* RODAPÉ DE AÇÕES */}
      <div className={styles.actionFooter}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={classNames(
            styles.saveButton,
            saveSuccess && styles.saveSuccess,
          )}
        >
          {saving ? (
            t("common:saving")
          ) : saveSuccess ? (
            <>
              <RiCheckLine /> {t("settings:save_success")}
            </>
          ) : (
            <>
              <RiSave3Fill /> {t("settings:save_profile")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
