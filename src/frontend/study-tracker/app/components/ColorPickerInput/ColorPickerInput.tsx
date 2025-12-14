import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Label, Input, Button } from "react-aria-components";
import { RiAddFill, RiCloseLine } from "react-icons/ri";
import styles from "./ColorPickerInput.module.css";
import { service } from "~/service/service";

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
  const currentColor = color || fallbackHexValue;

  const [customColors, setCustomColors] = useState<string[]>([]);

  useEffect(() => {
    service
      .fetchUserInfoFromApi()
      .then((user) => {
        const coresVindasDaBD =
          user.custom_colors ||
          (user as any).customColors ||
          (user as any).colors ||
          [];

        if (Array.isArray(coresVindasDaBD)) {
          setCustomColors(coresVindasDaBD);
        }
      })
      .catch((err) => console.error("Erro ao carregar user info:", err));
  }, []);

  const handleSaveColor = async () => {
    if (customColors.includes(currentColor)) return;

    const newColors = [currentColor, ...customColors];
    setCustomColors(newColors);

    try {
      await service.updateUserCustomColors(newColors);
    } catch (error) {
      console.error("Erro ao guardar cor:", error);
    }
  };

  const handleDeleteColor = async (colorToDelete: string) => {
    const newColors = customColors.filter((c) => c !== colorToDelete);
    setCustomColors(newColors);

    try {
      await service.updateUserCustomColors(newColors);
    } catch (error) {
      console.error("Erro ao apagar cor:", error);
    }
  };

  const isColorSaved = customColors.includes(currentColor);

  return (
    <div className={styles.container}>
      <Label className={styles.label}>{label}</Label>

      <div className={styles.inputWrapper}>
        <div className={styles.colorPreviewWrapper}>
          <Input
            type="color"
            value={currentColor}
            onChange={(e) => setColor(e.target.value)}
            className={styles.colorInput}
          />
          <div
            className={styles.colorPreview}
            style={{ backgroundColor: currentColor }}
          />
        </div>

        <span className={styles.hexValue}>{currentColor.toUpperCase()}</span>

        <Button
          className={`${styles.actionButton} ${
            isColorSaved ? styles.disabled : ""
          }`}
          isDisabled={isColorSaved}
          onPress={handleSaveColor}
          title="Guardar cor"
        >
          <RiAddFill />
        </Button>

        {color && (
          <Button
            className={styles.actionButton}
            onPress={clearColor}
            title="Limpar cor"
          >
            <RiCloseLine />
          </Button>
        )}
      </div>

      {customColors.length > 0 ? (
        <div className={styles.paletteSection}>
          <span className={styles.sectionTitle}>Minhas Cores</span>
          <div className={styles.presetGrid}>
            {customColors.map((c, index) => (
              <div key={`${c}-${index}`} className={styles.customColorWrapper}>
                <Button
                  className={styles.swatch}
                  style={{ backgroundColor: c }}
                  onPress={() => setColor(c)}
                />
                <Button
                  className={styles.deleteColorBtn}
                  onPress={() => handleDeleteColor(c)}
                >
                  <RiCloseLine size={12} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: "0.8rem",
            color: "#888",
            fontStyle: "italic",
            marginTop: "5px",
          }}
        >
          As tuas cores guardadas aparecerão aqui.
        </div>
      )}
    </div>
  );
}
