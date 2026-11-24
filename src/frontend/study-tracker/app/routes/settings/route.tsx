import React, { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./settings.module.css";
import classNames from "classnames";
import { RiSave3Fill, RiRestartLine, RiMoonClearFill } from "react-icons/ri";
import { useAppFeedback } from "~/components/error/GlobalErrorContainer";

function createAvatars(): string[] {
  return Array.from({ length: 12 }, (_, i) => `./avatars/avatar${i}.png`);
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "settings"]);
  const { notify } = useAppFeedback();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [displayName, setDisplayName] = useState<string>("");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(-1);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    const loadedAvatars = createAvatars();
    setAvatars(loadedAvatars);

    service.fetchUserInfoFromApi().then((data) => {
      setUser(data);
      setDisplayName(data.displayName || data.username || "");
      const currentAvatarIndex = loadedAvatars.findIndex((a) => a.includes(data.avatarFilename));
      setSelectedAvatarIndex(currentAvatarIndex !== -1 ? currentAvatarIndex : 0);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const filename = avatars[selectedAvatarIndex].split("/").pop() || "";
      await Promise.all([
        service.selectAvatar(filename),
        service.updateDisplayName(displayName)
      ]);
      notify({ type: "success", message: t("settings:saved_success") });
    } catch (error: any) {
      notify({ type: "error", message: t("settings:save_error", "Erro ao guardar!") });
    } finally { setSaving(false); }
  };

  if (loading) return <div className={styles.pageContainer}>{t("common:loading", "A carregar...")}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}><h1>{t("settings:page_title", "Definições")}</h1></div>
      <div className={styles.content}>
        
        {/* PERFIL */}
        <section className={styles.section}>
          <h2>{t("settings:student_profile", "Perfil do Aluno")}</h2>
          <div className={styles.profileCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("settings:display_name", "Nome de Exibição:")}</span>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={styles.input} />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("settings:email", "E-mail:")}</span>
              <span className={styles.value}>{user?.institutional_email}</span>
            </div>
          </div>
        </section>

        {/* AVATAR SELECTION */}
        <section className={styles.section}>
          <h2>{t("settings:avatar_title", "Avatar")}</h2>
          <div className={styles.avatarGrid}>
            {avatars.map((avatar, index) => (
              <div key={index} className={classNames(styles.avatarItem, selectedAvatarIndex === index && styles.avatarSelected)} onClick={() => setSelectedAvatarIndex(index)}>
                <img src={avatar} alt="Avatar" />
              </div>
            ))}
          </div>
        </section>

        {/* SISTEMA */}
        <section className={classNames(styles.section, styles.systemSection)}>
          <h2>{t("settings:system_title", "Sistema")}</h2>
          <div className={styles.systemFeature}>
            <RiMoonClearFill aria-hidden="true" />
            <span>{t("settings:dark_mode", "Modo Noturno (Em breve)")}</span>
          </div>
          <button onClick={() => window.location.reload()} className={styles.dangerButton}><RiRestartLine /> {t("settings:repeat_tutorial", "Repetir Tutorial")}</button>
        </section>

        <div style={{ height: "60px" }}></div>
      </div>

      {/* ACTION BAR */}
      <div className={styles.actionBar} style={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: "20px", 
          background: "linear-gradient(transparent, var(--color-1) 30%)",
          zIndex: 100 
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
          style={{ width: "100%", maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
        >
          {saving ? (
            t("settings:saving", "A guardar...")
          ) : (
            <><RiSave3Fill size={20} /> {t("settings:save_profile", "Guardar Perfil")}</>
          )}
        </button>
      </div>
    </div>
  );
}
