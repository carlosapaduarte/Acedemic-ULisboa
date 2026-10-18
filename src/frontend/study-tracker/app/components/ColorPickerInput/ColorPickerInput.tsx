import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Label, Input, Button } from "react-aria-components";
import { RiAddFill, RiCloseLine, RiDeleteBinLine } from "react-icons/ri";
import styles from "./ColorPickerInput.module.css";
import {
  getCustomColorsSnapshot,
  loadCustomColors,
  saveCustomColors,
  subscribeToCustomColors,
} from "./customColorsStore";

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

  const customColors = useSyncExternalStore(
    subscribeToCustomColors,
    getCustomColorsSnapshot,
    getCustomColorsSnapshot,
  );

  // Drag & Drop States
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColor, setDraggedColor] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const trashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadCustomColors();
  }, []);

  const handleSaveColor = async () => {
    if (customColors.includes(currentColor)) return;

    try {
      await saveCustomColors((colors) => [currentColor, ...colors]);
    } catch (error) {
      console.error("Erro ao guardar cor:", error);
    }
  };

  const handleDeleteColor = async (colorToDelete: string) => {
    try {
      await saveCustomColors((colors) =>
        colors.filter((c) => c !== colorToDelete),
      );
    } catch (error) {
      console.error("Erro ao apagar cor:", error);
    }
  };

  // --- DRAG (Desktop) ---
  const handleDragStart = (e: React.DragEvent, c: string) => {
    setDraggedColor(c);
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", c);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedColor(null);
    setIsOverTrash(false);
  };

  const handleDragOverTrash = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverTrash(true);
  };

  const handleDragLeaveTrash = () => {
    setIsOverTrash(false);
  };

  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedColor) {
      handleDeleteColor(draggedColor);
    }
    handleDragEnd();
  };

  const handleTouchStart = (c: string) => {
    setDraggedColor(c);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const trashElement = trashRef.current;
    if (trashElement) {
      const rect = trashElement.getBoundingClientRect();
      const x = touch.clientX;
      const y = touch.clientY;
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (isInside !== isOverTrash) setIsOverTrash(isInside);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const trashElement = trashRef.current;

    if (trashElement) {
      const rect = trashElement.getBoundingClientRect();
      const x = touch.clientX;
      const y = touch.clientY;

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        if (draggedColor) handleDeleteColor(draggedColor);
      }
    }
    handleDragEnd(); // Reset total
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
          title={t("save_color", "Guardar cor")}
        >
          <RiAddFill />
        </Button>

        {color && (
          <Button
            className={styles.actionButton}
            onPress={clearColor}
            title={t("clear_color", "Limpar cor")}
          >
            <RiCloseLine />
          </Button>
        )}
      </div>

      {customColors.length > 0 ? (
        <div className={styles.paletteSection}>
          <span className={styles.sectionTitle}>{t("my_colors", "Minhas Cores")}</span>

          <div className={styles.presetGrid}>
            {customColors.map((c, index) => (
              <div key={`${c}-${index}`} className={styles.customColorWrapper}>
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, c)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={() => handleTouchStart(c)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
            ))}
          </div>

          <div
            ref={trashRef}
            className={`
                ${styles.trashDropZone} 
                ${isOverTrash ? styles.trashActive : ""}
                ${isDragging && !isOverTrash ? styles.trashHint : ""}
              `}
            onDragOver={handleDragOverTrash}
            onDragLeave={handleDragLeaveTrash}
            onDrop={handleDropOnTrash}
          >
            <RiDeleteBinLine size={18} />
            <span>{t("drag_to_delete", "Arrastar para apagar")}</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-color-2)",
            opacity: 0.75,
            fontStyle: "italic",
            marginTop: "5px",
          }}
        >
          {t("saved_colors_empty", "As tuas cores guardadas aparecerão aqui.")}
        </div>
      )}
    </div>
  );
}
