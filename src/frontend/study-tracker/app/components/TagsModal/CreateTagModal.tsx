import React, { useEffect, useMemo, useState } from "react";
import { Button, Label, Input, TextField } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import { service, Tag } from "~/service/service";
import styles from "./TagModals.module.css";

interface CreateTagModalProps {
  onTagCreated: (newTag?: Tag) => void;
  close: () => void;
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

export function CreateTagModal({ onTagCreated, close }: CreateTagModalProps) {
  const { t } = useTranslation(["task", "calendar"]);
  const [namePt, setNamePt] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [tagColor, setTagColor] = useState("#888888");
  const [isSaving, setIsSaving] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);
  const [deselectedTagColor, setDeselectedTagColor] = useState<string>("");
  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
  const MAX_CHARS = 30;

  //vai buscar a lista de todas as tags do utilizador e guarda-a no estado allUserTags
  useEffect(() => {
    service
      .fetchUserTags()
      .then((tags) => setAllUserTags(Array.isArray(tags) ? tags : []))
      .catch(console.error);
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
    setColorError(
      distance < 30 ? t("color_too_similar_error", "Cor muito parecida.") : null
    );
  }, [tagColor, deselectedTagColor, t]);

  const nameError = useMemo(() => {
      (tag) =>
        "tag_already_exists_error",
    const en = nameEn.trim().toLowerCase();
    if (!pt && !en) return null;
    const isDuplicate = allUserTags.some((tag) => {
      const existingPt = tag.name_pt?.toLowerCase();
      const existingEn = tag.name_en?.toLowerCase();
      const conflictPt = pt && (existingPt === pt || existingEn === pt);
      const conflictEn = en && (existingPt === en || existingEn === en);
      return conflictPt || conflictEn;
    });
    return isDuplicate ? t("tag_exists", "Tag já existe") : null;
  }, [namePt, nameEn, allUserTags, t]);

  const handleSave = async () => {
    if (!namePt.trim() && !nameEn.trim()) return;
    if (nameError || colorError) return;

    setIsSaving(true);
    try {
      const createdTag = await service.createTag({
        name_pt: namePt.trim() || undefined,
        name_en: nameEn.trim() || undefined,
        color: tagColor,
        is_uc: false,
      } as any);
      onTagCreated?.(createdTag);
      close();
    } catch (err) {
      console.error(err);
      alert(t("error_creating_tag", "Erro ao criar tag"));
    } finally {
      setIsSaving(false);
    }
  };
            </svg>
            />
            <div className={styles.charCounter}>

  return (
    <div className={styles.tagModalContent}>
      <TextField className={styles.textField} autoFocus>
        <Label>{t("tag_name_pt_label", "Nome (PT)")}</Label>
        <Input
          value={namePt}
          onChange={(e) => setNamePt(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder={t("new_tag_name_placeholder", "Ex: Trabalho")}
        />
        <div className={styles.charCounter}>
          {namePt.length}/{MAX_CHARS}
        </div>
      </TextField>

      <TextField className={styles.textField}>
        <Label>{t("tag_name_en_label", "Nome (EN)")}</Label>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder={t("new_tag_name_en_placeholder", "Ex: Work")}
        />
        <div className={styles.charCounter}>
          {nameEn.length}/{MAX_CHARS}
        </div>
      </TextField>

      <ColorPickerInput
        label={t("color", "Cor")}
        color={tagColor}
        setColor={setTagColor}
        clearColor={() => setTagColor("#888888")}
      />

      {(nameError || colorError) && (
        <p className={styles.error}>{nameError || colorError}</p>
      )}

      <Button
        onPress={handleSave}
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
          : t("create_new_tag_button", "Criar")}
      </Button>
    </div>
  );
}
