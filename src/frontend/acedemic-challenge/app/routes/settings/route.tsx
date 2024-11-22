import styles from "./settingsPage.module.css";
import { AppTheme, getAppThemeClassNames, ThemeContext } from "~/components/Theme/ThemeProvider";
import { useContext } from "react";
import classNames from "classnames";
import { InConstructionPage } from "~/Pages/InConstruction";

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
    {
        optionTheme,
        currentTheme,
        setTheme
    }: {
        optionTheme: AppTheme,
        currentTheme: AppTheme,
        setTheme: (theme: AppTheme) => void
    }
) {
    return (
        <div className={styles.themeOption}>
            <input type="radio" name="selectedTheme" id={optionTheme} onClick={
                () => setTheme(optionTheme)
            }
                   checked={optionTheme === currentTheme}
                   onChange={() => {
                   }} />
            <label className={styles.themeLabel} htmlFor={optionTheme}>
                {`${optionTheme}${optionTheme === AppTheme.defaultTheme ? " (default)" : ""}`}
            </label>
            <ThemePalette optionTheme={optionTheme} />
        </div>
    );
}

export default function SettingsPage() {
    const { theme, setTheme } = useContext(ThemeContext);

    return <InConstructionPage />;

    return (
        <div className={styles.settingsPage}>
            <h1>Settings</h1>

            <h1 className={styles.settingTitle}>Theme</h1>
            {
                AppTheme.values.map((optionTheme) => (
                    <ThemeOption key={optionTheme} optionTheme={optionTheme} currentTheme={theme} setTheme={setTheme} />
                ))
            }
        </div>
    );
}
