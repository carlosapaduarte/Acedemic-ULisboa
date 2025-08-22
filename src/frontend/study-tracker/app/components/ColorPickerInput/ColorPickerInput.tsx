import React from "react";
import { useTranslation } from "react-i18next";
import { Label, Input, Button } from "react-aria-components";
import styles from "./ColorPickerInput.module.css";

interface ColorPickerInputProps {
  label?: string;
  color?: string;
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
          value={color}
          onChange={(e) => {
            console.log("ColorPickerInput: Cor selecionada:", e.target.value);
            setColor(e.target.value);
          }}
          className={styles.colorInput}
        />

        <span className={styles.hexValue}>{color.toUpperCase()}</span>
        {color && (
          <Button
            className={styles.clearButton}
            onPress={() => {
              console.log("ColorPickerInput:  A limpar a cor");
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
