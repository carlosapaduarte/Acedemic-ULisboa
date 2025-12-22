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

const TagSectionContent = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  onEditTags,
  onAddTag,
  refreshTags,
}: Props) => {
  const { t, i18n, ready } = useTranslation(["task", "calendar"]);

  if (!ready) return null;

  const validTags = React.useMemo(() => {
    if (!availableTags || !Array.isArray(availableTags)) return [];
    return availableTags.filter((tag) => tag && tag.id);
  }, [availableTags]);

  const safeSelectedIds = React.useMemo(() => {
    if (!selectedTagIds || !Array.isArray(selectedTagIds)) return [];
    return selectedTagIds;
  }, [selectedTagIds]);

  const toggle = (id: string) => {
    if (!id) return;
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
      return t(`tags:${tag.name}`, { defaultValue: t(tag.name) });
    }

    const lang = i18n?.language ? i18n.language.toLowerCase() : "pt";

    if (lang.startsWith("en") && tag.name_en) {
      return tag.name_en;
    }

    return tag.name_pt || tag.name || "Sem nome";
  };

  const getStyle = (className: string) => {
    return styles && styles[className] ? styles[className] : className;
  };

  const renderTagButton = (tag: Tag) => {
    if (!tag || !tag.id) return null;
    const isSelected = safeSelectedIds.includes(tag.id);

    const baseClass = getStyle("tagItem");
    const selectedClass = getStyle("selectedTagItem");
    const className = isSelected ? `${baseClass} ${selectedClass}` : baseClass;

    return (
      <button
        key={tag.id}
        type="button"
        onClick={() => toggle(tag.id)}
        className={className}
        style={{
          backgroundColor: isSelected ? tag.color || "#ccc" : undefined,
          border: !styles ? "1px solid #ccc" : undefined,
          margin: !styles ? "2px" : undefined,
        }}
      >
        {getTagName(tag)}
      </button>
    );
  };

  const customTags = validTags.filter((tag) => !tag.is_uc);
  const ucTags = validTags.filter((tag) => tag.is_uc);

  return (
    <div className={getStyle("tagsSectionContainer")}>
      <div className={getStyle("tagsHeader")}>
        <h3 className={getStyle("formSectionTitle")}>
          {t("tags_title", "Etiquetas")}
        </h3>
        <button
          type="button"
          onClick={onEditTags}
          className={getStyle("headerButton")}
          aria-label={t("manage_tags", "Gerir etiquetas")}
        >
          <RiSettings5Fill size={20} />
        </button>
      </div>

      <div className={getStyle("tagsBox")}>
        {customTags.map(renderTagButton)}

        <button
          type="button"
          className={getStyle("addTagButtonRound")}
          onClick={onAddTag}
          aria-label={t("add_tag", "Criar nova etiqueta")}
        >
          +
        </button>
      </div>

      <div className={getStyle("ucTagsContainer")}>
        <div className={getStyle("ucTagsLabel")}>
          {t("ucs_tags", "Unidades Curriculares")}
        </div>
        {ucTags.length > 0 ? (
          <div className={getStyle("ucTagsList")}>
            {ucTags.map(renderTagButton)}
          </div>
        ) : (
          <p className={getStyle("emptyUcText")}>
            {t("task:no_ucs_text", "Ainda não tens UCs associadas.")}{" "}
            <Link to="/curricular-units" className={getStyle("emptyUcLink")}>
              {t("task:add_ucs_link", "Adicionar UCs")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export const TagSection = (props: Props) => (
  <React.Suspense
    fallback={<div className={styles?.tagsSectionContainer}>A carregar...</div>}
  >
    <TagSectionContent {...props} />
  </React.Suspense>
);
