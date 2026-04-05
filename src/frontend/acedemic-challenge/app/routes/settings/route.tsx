import styles from "./settingsPage.module.css";
// import { AppTheme, getAppThemeClassNames, ThemeContext } from "~/components/Theme/ThemeProvider";
import React, { useState, useEffect } from "react";
import classNames from "classnames";

const OBJETIVOS = [
    "Melhorar as minhas notas/classificações",
    "Acompanhar o meu progresso",
    "Preparar-me para exames específicos",
    "Personalizar o meu plano de estudo",
    "Cumprir prazos e entregas",
    "Gerir os estudos com as outras áreas da minha vida"
];

/* ==========================================
   TEMA COMENTADO POR ENQUANTO
   ==========================================
function ThemePalette({ optionTheme }: { optionTheme: AppTheme }) {
    return (
        <div className={classNames(styles.themePalette, getAppThemeClassNames(optionTheme))}>
            <div className={styles.themePaletteItem}></div>
            <div className={styles.themePaletteItem}></div>
            <div className={styles.themePaletteItem}></div>
        </div>
    );
}

function ThemeOption(
    { optionTheme, currentTheme, setTheme }: { optionTheme: AppTheme, currentTheme: AppTheme, setTheme: (theme: AppTheme) => void }
) {
    return (
        <div className={styles.themeOption}>
            <input type="radio" name="selectedTheme" id={optionTheme} onClick={() => setTheme(optionTheme)}
                   checked={optionTheme === currentTheme} onChange={() => {}} />
            <label className={styles.themeLabel} htmlFor={optionTheme}>
                {`${optionTheme}${optionTheme === AppTheme.defaultTheme ? " (default)" : ""}`}
            </label>
            <ThemePalette optionTheme={optionTheme} />
        </div>
    );
}
========================================== */


export default function SettingsPage() {
    // const { theme, setTheme } = useContext(ThemeContext);
    
    // Estado para guardar os objetivos que o utilizador seleciona
    const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

    // Quando a página abre, vai buscar as opções guardadas no browser
    useEffect(() => {
        const saved = localStorage.getItem("user_objectives");
        if (saved) {
            try {
                setSelectedObjectives(JSON.parse(saved));
            } catch (e) {
                console.error("Erro ao ler objetivos guardados");
            }
        }
    }, []);

    // Função que corre sempre que a pessoa clica numa checkbox
    const handleToggle = (obj: string) => {
        setSelectedObjectives((prev) => {
            const newSelection = prev.includes(obj) 
                ? prev.filter(item => item !== obj) // Tira se já lá estava
                : [...prev, obj]; // Adiciona se não estava
            
            // Guarda automaticamente sem precisar de botão "Gravar"
            localStorage.setItem("user_objectives", JSON.stringify(newSelection));
            return newSelection;
        });
    };

    return (
        <div className={styles.settingsPage} style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            
            {/* Secção dos Objetivos igual à tua imagem */}
            <div style={{ 
                backgroundColor: "#fbe4c7", // O fundo bege da tua imagem
                padding: "2rem", 
                borderRadius: "8px",
                color: "#000",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ 
                    textAlign: "center", 
                    marginBottom: "1.5rem", 
                    fontSize: "2rem", 
                    fontWeight: "bold",
                    color: "#000"
                }}>
                    Objetivos de Uso
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "10px" }}>
                    {OBJETIVOS.map((obj) => (
                        <label key={obj} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px", 
                            cursor: "pointer", 
                            fontSize: "1.1rem" 
                        }}>
                            <input 
                                type="checkbox" 
                                checked={selectedObjectives.includes(obj)}
                                onChange={() => handleToggle(obj)}
                                style={{ width: "18px", height: "18px", cursor: "pointer" }}
                            />
                            {obj}
                        </label>
                    ))}
                </div>
            </div>

            {/* ==========================================
                TEMA COMENTADO POR ENQUANTO
                ==========================================
            <h1 className={styles.settingTitle} style={{ marginTop: "3rem" }}>Theme</h1>
            {
                AppTheme.values.map((optionTheme) => (
                    <ThemeOption key={optionTheme} optionTheme={optionTheme} currentTheme={theme} setTheme={setTheme} />
                ))
            } 
            */}
        </div>
    );
}