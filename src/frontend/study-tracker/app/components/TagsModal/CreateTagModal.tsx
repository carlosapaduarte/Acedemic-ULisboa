import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  Label,
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
  const [namePt, setNamePt] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [tagColor, setTagColor] = useState("#888888");
  const [isSaving, setIsSaving] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);
  const [deselectedTagColor, setDeselectedTagColor] = useState<string>("");
  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);

  //vai buscar a lista de todas as tags do utilizador e guarda-a no estado allUserTags
  useEffect(() => {
    service
      .fetchUserTags()
      .then(setAllUserTags)
      .catch((err) => console.error("Falha ao carregar tags existentes:", err));
  }, []);

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

  const nameError = useMemo(() => {
    const normalizedInputPt = namePt.trim().toLowerCase();
    const normalizedInputEn = nameEn.trim().toLowerCase();

    if (normalizedInputPt.length === 0 && normalizedInputEn.length === 0)
      return null;

    const isDuplicate = allUserTags.some(
      (tag) =>
        (tag.name_pt && normalizedInputPt === tag.name_pt.toLowerCase()) ||
        (tag.name_en && normalizedInputPt === tag.name_en.toLowerCase()) ||
        (tag.name_pt && normalizedInputEn === tag.name_pt.toLowerCase()) ||
        (tag.name_en && normalizedInputEn === tag.name_en.toLowerCase())
    );
    if (isDuplicate) {
      return t(
        "tag_already_exists_error",
        "Uma tag com um destes nomes já existe."
      );
    }

    return null;
  }, [namePt, nameEn, allUserTags, t]);

  const handleSave = async (close: () => void) => {
    if (!namePt.trim() && !nameEn.trim()) {
      return;
    }
    if (nameError || colorError) return;

    setIsSaving(true);
    try {
      await service.createTag({
        name_pt: namePt.trim() || undefined,
        name_en: nameEn.trim() || undefined,
        color: tagColor,
      });
      onTagCreated();
      close();
    } catch (err: any) {
      console.error("Erro ao criar tag:", err);
      alert(t("error_creating_tag", "Ocorreu um erro ao criar a tag"));
    } finally {
      setIsSaving(false);
    }
  };
  const MAX_CHARS = 30;
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
            <Label>{t("tag_name_pt_label", "Nome da Etiqueta (PT)")}</Label>
            <Input
              value={namePt}
              onChange={(e) => setNamePt(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder={t("new_tag_name_placeholder")}
            />
            <div className={styles.charCounter}>
              {namePt.length} / {MAX_CHARS}
            </div>
          </TextField>
          <TextField className={styles.textField}>
            <Label>{t("tag_name_en_label", "Tag Name (EN)")}</Label>
            <Input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder={t("new_tag_name_en_placeholder", "e.g. Study")}
            />
            <div className={styles.charCounter}>
              {nameEn.length} / {MAX_CHARS}
            </div>
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
            isDisabled={
              isSaving ||
              !!nameError ||
              !!colorError ||
              (!namePt.trim() && !nameEn.trim())
            }
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
