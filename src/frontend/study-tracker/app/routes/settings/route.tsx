import React, { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";
import { useTranslation } from "react-i18next";
import styles from "./settings.module.css";
import {
  RiSave3Fill,
  RiRestartLine,
  RiCheckLine,
} from "react-icons/ri";

const OBJETIVOS_LIST = [
  "Melhorar as minhas notas/classificações",
  "Acompanhar o meu progresso",
  "Preparar-me para exames específicos",
  "Personalizar o meu plano de estudo",
  "Cumprir prazos e entregas",
  "Gerir os estudos com as outras áreas da minha vida"
];

function createAvatars(): string[] {
  const avatars: string[] = [];
  for (let u = 0; u < 12; u++) {
    avatars.push(`./avatars/avatar${u}.png`);
  }
  return avatars;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common"]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Form States
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(-1);
  const [avatars, setAvatars] = useState<string[]>([]);
  // Agora guardamos os NÚMEROS dos objetivos (ex: [0, 2, 4]) para o backend perceber
  const [selectedObjetivos, setSelectedObjetivos] = useState<number[]>([]);

  // Load Data
  useEffect(() => {
    const loadedAvatars = createAvatars();
    setAvatars(loadedAvatars);

    service
      .fetchUserInfoFromApi()
      .then((data) => {
        setUser(data);

        if (data.use_goals) {
          setSelectedObjetivos(data.use_goals);
        }

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

  // Lógica para marcar/desmarcar a checklist usando o índice do Array
  const handleToggleObjetivo = (index: number) => {
      setSelectedObjetivos((prev) => {
          const newSelection = prev.includes(index)
              ? prev.filter((i) => i !== index)
              : [...prev, index];
          return newSelection;
      });
  };

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

      // 2. NOVO: Enviar os objetivos para a Base de Dados!
      promises.push(service.updateAppUseGoals(new Set(selectedObjetivos)));

      if (promises.length > 0) {
        await Promise.all(promises);

        // Atualizar o estado local do user para refletir a mudança
        setUser({
          ...user,
          avatarFilename:
            newAvatarFullString.split("/").pop() || user.avatarFilename,
        });
      }

      // Feedback visual de sucesso
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      alert(`Erro ao guardar: ${error.message || "Verifica a consola."}`);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetTutorial = () => {
    if (confirm("Tens a certeza que queres repetir os tutoriais? (Isto vai reiniciar todos os guias da aplicação)")) {
      
      // Limpa tudo o que seja "tutorial" no browser inteiro
      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes("tutorial")) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.toLowerCase().includes("tutorial")) sessionStorage.removeItem(key);
      });

      alert("Tutoriais reiniciados! A página vai recarregar.");
      window.location.reload();
    }
  };

  if (loading)
    return <div className={styles.container}>A carregar definições...</div>;

  return (
    <div className={styles.pageContainer} style={{ paddingBottom: "100px" }}>
      <div className={styles.header}>
        <h1>Definições</h1>
      </div>

      <div className={styles.content}>
        {/* PERFIL (Read Only) */}
        <section className={styles.section}>
          <h2>Perfil do Aluno</h2>
          <div className={styles.profileCard} style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px" }}>
            <div className={styles.infoRow} style={{ marginBottom: "10px" }}>
              <span className={styles.label}>Nome de Exibição:</span>
              <span className={styles.value} style={{ fontWeight: "bold", color: "var(--color-2)" }}>
                {user?.display_name || "Não definido"}
              </span>
            </div>
            <div className={styles.infoRow} style={{ marginBottom: "10px" }}>
              <span className={styles.label}>ID Fénix:</span>
              <span className={styles.value}>{user?.username}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>E-mail:</span>
              <span className={styles.value} style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                {user?.institutional_email || "---"}
              </span>
            </div>
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

        {/* OBJETIVOS DE USO (Agora com index em vez de strings) */}
        <section className={styles.section}>
          <h2>Objetivos de Uso</h2>
          <p className={styles.description} style={{ marginBottom: "1rem" }}>
            Quais as tuas metas principais ao usar a plataforma?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
          <button onClick={handleResetTutorial} className={styles.dangerButton} style={{ opacity: 0.8 }}>
            <RiRestartLine /> Repetir Tutorial Global
          </button>
        </section>

        {/* ESPAÇADOR PARA O BOTÃO NÃO TAPAR O CONTEÚDO */}
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
          style={{ width: "100%", maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {saving ? (
            "A guardar..."
          ) : saveSuccess ? (
            <><RiCheckLine /> Alterações Guardadas!</>
          ) : (
            <><RiSave3Fill /> Guardar Perfil</>
          )}
        </button>
      </div>
    </div>
  );
}