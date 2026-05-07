import React, { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./settings.module.css";
import classNames from "classnames";
import { RiSave3Fill, RiRestartLine, RiCheckLine, RiMoonClearFill } from "react-icons/ri";

const OBJETIVOS_LIST = [
  "Melhorar as minhas notas/classificações",
  "Acompanhar o meu progresso",
  "Preparar-me para exames específicos",
  "Personalizar o meu plano de estudo",
  "Cumprir prazos e entregas",
  "Gerir os estudos com as outras áreas da minha vida"
];

function createAvatars(): string[] {
  return Array.from({ length: 12 }, (_, i) => `./avatars/avatar${i}.png`);
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "settings"]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const [displayName, setDisplayName] = useState<string>("");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(-1);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedObjetivos, setSelectedObjetivos] = useState<number[]>([]);

  useEffect(() => {
    const loadedAvatars = createAvatars();
    setAvatars(loadedAvatars);

    service.fetchUserInfoFromApi().then((data) => {
      setUser(data);
      setDisplayName(data.displayName || data.username || "");
      if (data.use_goals) setSelectedObjetivos(data.use_goals);
      const currentAvatarIndex = loadedAvatars.findIndex((a) => a.includes(data.avatarFilename));
      setSelectedAvatarIndex(currentAvatarIndex !== -1 ? currentAvatarIndex : 0);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleObjetivo = (index: number) => {
      setSelectedObjetivos((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const filename = avatars[selectedAvatarIndex].split("/").pop() || "";
      await Promise.all([
        service.selectAvatar(filename),
        service.updateAppUseGoals(new Set(selectedObjetivos)),
        service.updateDisplayName(displayName)
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      alert("Erro ao guardar!");
    } finally { setSaving(false); }
  };

  if (loading) return <div className={styles.pageContainer}>A carregar...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}><h1>Definições</h1></div>
      <div className={styles.content}>
        
        {/* PERFIL */}
        <section className={styles.section}>
          <h2>Perfil do Aluno</h2>
          <div className={styles.profileCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nome de Exibição:</span>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={styles.nameInput} />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>E-mail:</span>
              <span className={styles.value_text}>{user?.institutional_email}</span>
            </div>
          </div>
        </section>

        {/* AVATAR SELECTION */}
        <section className={styles.section}>
          <h2>Avatar</h2>
          <div className={styles.avatarGrid}>
            {avatars.map((avatar, index) => (
              <div key={index} className={classNames(styles.avatarItem, selectedAvatarIndex === index && styles.avatarSelected)} onClick={() => setSelectedAvatarIndex(index)}>
                <img src={avatar} alt="Avatar" />
              </div>
            ))}
          </div>
        </section>

        {/* OBJETIVOS DE USO */}
        <section className={styles.section}>
          <h2>Objetivos de Uso</h2>
          <div className={styles.goalsContainer}>
            {OBJETIVOS_LIST.map((obj, index) => (
              <label key={index} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedObjetivos.includes(index)}
                  onChange={() => handleToggleObjetivo(index)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--color-2)" }}
                />
                <span style={{ fontSize: "0.95rem" }}>{obj}</span>
              </label>
            ))}
          </div>
        </section>

        {/* SISTEMA */}
        <section className={styles.section} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
          <h2>Sistema</h2>
          <div className={styles.toggleRow} style={{ opacity: 0.6, marginBottom: "1rem" }}>
            <span><RiMoonClearFill /> Modo Noturno (Em breve)</span>
            <label className={styles.switch}><input type="checkbox" disabled /><span className={styles.slider}></span></label>
          </div>
          <button onClick={() => window.location.reload()} className={styles.dangerButton}><RiRestartLine /> Repetir Tutorial</button>
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
          className={`${styles.saveButton} ${saveSuccess ? styles.success : ""}`}
          style={{ width: "100%", maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
        >
          {saving ? (
            "A guardar..."
          ) : saveSuccess ? (
            <><RiCheckLine size={20} /> Alterações Guardadas!</>
          ) : (
            <><RiSave3Fill size={20} /> Guardar Perfil</>
          )}
        </button>
      </div>
    </div>
  );
}