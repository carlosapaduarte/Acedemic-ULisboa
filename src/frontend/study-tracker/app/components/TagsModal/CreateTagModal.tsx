import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";
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
  const [tagColor, setTagColor] = useState("#888888"); // Cor cinza default da imagem
  const [isSaving, setIsSaving] = useState(false);
  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);

  const MAX_CHARS = 30;

  // Carregar tags existentes
  useEffect(() => {
    service
      .fetchUserTags()
      .then((tags) => setAllUserTags(Array.isArray(tags) ? tags : []))
      .catch(console.error);
  }, []);

  const nameError = useMemo(() => {
    const pt = namePt.trim().toLowerCase();
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
    if (nameError) return;

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

  return (
    <div className={styles.createTagTooltip}>
      {/* 1. NOME PT */}
      <div>
        <label>{t("tag_name_pt_label", "Nome da Etiqueta (PT)")}</label>
        <input
          type="text"
          value={namePt}
          onChange={(e) => setNamePt(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder={t("new_tag_name_placeholder", "Nome da nova etiqueta")}
          autoFocus
        />
        <div className={styles.charCounter}>
          {namePt.length} / {MAX_CHARS}
        </div>
      </div>

      <div>
        <label>{t("tag_name_en_label", "Tag Name (EN)")}</label>
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          maxLength={MAX_CHARS}
          placeholder="e.g. Study"
        />
        <div className={styles.charCounter}>
          {nameEn.length} / {MAX_CHARS}
        </div>
      </div>

      <div>
        <label>{t("color", "Cor")}</label>
        <div className={styles.customColorBox}>
          <input
            type="color"
            className={styles.hiddenColorInput}
            value={tagColor}
            onChange={(e) => setTagColor(e.target.value)}
          />

          <div
            className={styles.previewDot}
            style={{ backgroundColor: tagColor }}
          />
          <span className={styles.hexLabel}>{tagColor}</span>

          <button
            className={styles.resetColorBtn}
            onClick={(e) => {
              e.stopPropagation();
              setTagColor("#888888");
            }}
            title="Resetar cor"
          >
            <FaXmark />
          </button>
        </div>
      </div>

      {nameError && (
        <div
          style={{ color: "#ff8a80", fontSize: "0.8rem", textAlign: "center" }}
        >
          {nameError}
        </div>
      )}

      <button
        className={styles.createBtn}
        onClick={handleSave}
        disabled={isSaving || (namePt === "" && nameEn === "")}
      >
        {isSaving ? "..." : t("create_new_tag_button", "Criar nova etiqueta")}
      </button>
    </div>
  );
}
