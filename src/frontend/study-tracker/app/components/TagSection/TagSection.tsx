import React from "react";
import { useTranslation } from "react-i18next";
import { RiSettings5Fill } from "react-icons/ri";
import { Link } from "@remix-run/react";
import { Tag } from "~/service/service";
import styles from "./TagSection.module.css";

interface Props {
  availableTags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  onEditTags: () => void;
  onAddTag: () => void;
  refreshTags: (newTag?: Tag) => void;
}

export const TagSection = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  onEditTags,
  onAddTag,
  refreshTags,
}: Props) => {
  const { t, i18n } = useTranslation(["task", "calendar"]);

  const validTags = React.useMemo(() => {
    if (!Array.isArray(availableTags)) return [];
    return availableTags.filter((tag) => tag && tag.id);
  }, [availableTags]);

  const safeSelectedIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];

  const toggle = (id: string) => {
    setSelectedTagIds((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
    });
  };

  const getTagName = (tag: Tag) => {
    if (!tag) return "";
    if (tag.name && ["fun", "work", "personal", "study"].includes(tag.name)) {
      return t(tag.name);
    }
    const lang = i18n?.language ? i18n.language.toLowerCase() : "pt";
    if (lang.startsWith("en") && tag.name_en) {
      return tag.name_en;
    }
    return tag.name_pt || tag.name || "Sem nome";
  };

  const renderTagButton = (tag: Tag) => {
    if (!tag || !tag.id) return null;
    const isSelected = safeSelectedIds.includes(tag.id);

    const btnClass = styles.tagItem
      ? `${styles.tagItem} ${isSelected ? styles.selectedTagItem : ""}`
      : "tag-item";

    return (
      <button
        key={tag.id}
        type="button"
        onClick={() => toggle(tag.id)}
        className={btnClass}
        style={{
          backgroundColor: isSelected ? tag.color || "#ccc" : undefined,
        }}
      >
        {getTagName(tag)}
      </button>
    );
  };

  const customTags = validTags.filter((tag) => !tag.is_uc);
  const ucTags = validTags.filter((tag) => tag.is_uc);

  if (!styles) return null;

  return (
    <div className={styles.tagsSectionContainer}>
      <div className={styles.tagsHeader}>
        <h3 className={styles.formSectionTitle}>
          {t("tags_title", "Etiquetas")}
        </h3>
        <button
          type="button"
          onClick={onEditTags}
          className={styles.headerButton}
          aria-label={t("manage_tags", "Gerir etiquetas")}
        >
          <RiSettings5Fill size={20} />
        </button>
      </div>

      <div className={styles.tagsBox}>
        {customTags.map(renderTagButton)}

        <button
          type="button"
          className={styles.addTagButtonRound}
          onClick={onAddTag}
          aria-label={t("add_tag", "Criar nova etiqueta")}
        >
          +
        </button>
      </div>

      <div className={styles.ucTagsContainer}>
        <div className={styles.ucTagsLabel}>
          {t("ucs_classes", "UCS / Aulas")}
        </div>
        {ucTags.length > 0 ? (
          <div className={styles.ucTagsList}>{ucTags.map(renderTagButton)}</div>
        ) : (
          <p className={styles.emptyUcText}>
            {t("task:no_ucs_text", "Ainda não tens UCs associadas.")}{" "}
            <Link to="/tracker/curricular-units" className={styles.emptyUcLink}>
              {t("task:add_ucs_link", "Adicionar UCs")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
