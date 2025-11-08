import React from "react";
import { useTranslation } from "react-i18next";
import { Label, Input, Button } from "react-aria-components";
import styles from "./ColorPickerInput.module.css";

const PRESET_COLORS = [
  // Linha 1: Cinzas
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#B7B7B7",
  "#D9D9D9",
  "#EFEFEF",
  "#F3F3F3",
  "#FFFFFF",
  // Linha 2: Cores Vivas
  "#980000",
  "#FF0000",
  "#FF9900",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#4A86E8",
  "#0000FF",
  "#9900FF",
  "#FF00FF",
  // Linha 3: Cores Pastel
  "#E6B8AF",
  "#F4CCCC",
  "#FCE5CD",
  "#FFF2CC",
  "#D9EAD3",
  "#D0E0E3",
  "#C9DAF8",
  "#CFE2F3",
  "#D9D2E9",
  "#EAD1DC",
  // Linha 4: Cores Principais
  "#660000",
  "#CC0000",
  "#E69138",
  "#F1C232",
  "#6AA84F",
  "#45818E",
  "#3C78D8",
  "#3D85C6",
  "#674EA7",
  "#A64D79",
];

interface ColorPickerInputProps {
  label?: string;
  color?: string | null;
  setColor: (color: string) => void;
  clearColor: () => void;
}

export function ColorPickerInput({
  label,
  color,
  setColor,
  clearColor,
}: ColorPickerInputProps) {
  const { t } = useTranslation("calendar");

  const fallbackHexValue = "#703f3a";

  return (
    <>
      <div className={styles.colorPickerContainer}>
        <Label className={styles.label}>{label}</Label>
        <div className={styles.inputWrapper}>
          <Input
            type="color"
            value={color || fallbackHexValue}
            style={{
              backgroundColor: color ? color : "var(--color-event-fallback)",
            }}
            onChange={(e) => {
              setColor(e.target.value);
            }}
            className={styles.colorInput}
          />
          {color ? (
            <span className={styles.hexValue}>{color.toUpperCase()}</span>
          ) : (
            <span className={styles.hexValue}>
              {t("choose_a_color", "Escolha uma cor")}
            </span>
          )}

          {color && (
            <Button
              className={styles.clearButton}
              onPress={() => {
                clearColor();
              }}
              aria-label={t("clear_custom_color")}
            >
              &times;
            </Button>
          )}
        </div>
      </div>
      <div className={styles.presetGrid}>
        {/* Botão "Nenhuma Cor" */}
        <Button
          className={`${styles.swatch} ${styles.noColorSwatch}`}
          onPress={clearColor}
          aria-label={t("no_color", "Nenhuma cor")}
        >
          🚫
        </Button>

        {/* Grelha de Cores Predefinidas */}
        {PRESET_COLORS.map((preset) => (
          <Button
            key={preset}
            className={styles.swatch}
            style={{ backgroundColor: preset }}
            onPress={() => setColor(preset)}
            aria-label={preset}
          />
        ))}
      </div>
    </>
  );
}
