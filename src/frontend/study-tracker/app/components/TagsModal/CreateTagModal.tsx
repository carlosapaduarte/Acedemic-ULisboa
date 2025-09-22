import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Input,
  TextField,
  OverlayArrow,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import { service, Tag } from "~/service/service";
import styles from "./TagModals.module.css";

interface CreateTagModalProps {
  onTagCreated: () => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getColorDistance(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return Infinity;
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
}

export function CreateTagModal({ onTagCreated }: CreateTagModalProps) {
  const { t } = useTranslation("calendar");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#888888");
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [deselectedTagColor, setDeselectedTagColor] = useState<string>("");
  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const colorValue = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-2")
        .trim();
      setDeselectedTagColor(colorValue || "#8d8d8d");
    }
  }, []);

  useEffect(() => {
    if (!deselectedTagColor) return;
    const distance = getColorDistance(tagColor, deselectedTagColor);
    if (distance < 30) {
      setColorError(
        t(
          "color_too_similar_error",
          "Esta cor é muito parecida com a das tags inativas."
        )
      );
    } else {
      setColorError(null);
    }
  }, [tagColor, deselectedTagColor, t]);

  const handleSave = async (close: () => void) => {
    if (!tagName.trim()) {
      setNameError(
        t("tag_name_required_error", "O nome da tag não pode estar vazio.")
      );
      return;
    }
    setNameError(null);

    if (colorError) return;

    setIsSaving(true);
    try {
      await service.createTag({ name: tagName, color: tagColor });
      onTagCreated();
      close();
    } catch (err: any) {
      console.error("Erro ao criar tag:", err);
      setNameError(err?.message || "Ocorreu um erro.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog className={styles.tagModal}>
      {({ close }) => (
        <>
          <OverlayArrow className={styles.arrow}>
            <svg width={12} height={12} viewBox="0 0 12 12">
              <path d="M0 12 L6 6 L12 12" />
            </svg>
          </OverlayArrow>

          <TextField className={styles.textField} autoFocus>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={t(
                "new_tag_name_placeholder",
                "Nome da nova etiqueta"
              )}
            />
          </TextField>

          <ColorPickerInput
            color={tagColor}
            setColor={setTagColor}
            clearColor={() => setTagColor("#888888")}
          />

          {(nameError || colorError) && (
            <p className={styles.error}>{nameError || colorError}</p>
          )}

          <Button
            onPress={() => handleSave(close)}
            className={styles.saveButton}
            isDisabled={isSaving || !!colorError || !tagName.trim()}
          >
            {isSaving
              ? t("saving_button", "A Guardar...")
              : t("create_new_tag_button", "Criar nova etiqueta")}
          </Button>
        </>
      )}
    </Dialog>
  );
}
