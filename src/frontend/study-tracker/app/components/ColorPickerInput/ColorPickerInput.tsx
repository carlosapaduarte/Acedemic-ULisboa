import React from "react";
import { useTranslation } from "react-i18next";
import { Label, Input, Button } from "react-aria-components";
import styles from "./ColorPickerInput.module.css";

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

  return (
    <div className={styles.colorPickerContainer}>
      <Label className={styles.label}>{label}</Label>
      <div className={styles.inputWrapper}>
        <Input
          type="color"
          // como o input de cor não pode ter valor nulo fica branco como fallback
          value={color || "#ffffff"}
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
  );
}
