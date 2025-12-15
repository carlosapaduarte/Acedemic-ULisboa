import React from "react";
import { useTranslation } from "react-i18next";
import { RiSettings5Fill } from "react-icons/ri";
import { Link } from "@remix-run/react";
import { Tag } from "~/service/service";
import styles from "./TagSection.module.css";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import {
  DialogTrigger,
  Popover,
  Dialog,
  OverlayArrow,
  Button,
} from "react-aria-components";

interface Props {
  availableTags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  onEditTags: () => void;
  refreshTags: (newTag?: Tag) => void;
}

export const TagSection = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  onEditTags,
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
    if (!tag) return ""; // Proteção extra

    if (tag.name && ["fun", "work", "personal", "study"].includes(tag.name)) {
      return t(tag.name);
    }
    const lang = i18n?.language ? i18n.language.toLowerCase() : "pt";
    return tag.name_pt || tag.name || "Sem nome";
  };
    refreshTags(newTag);
    if (newTag && newTag.id) {
      setSelectedTagIds((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.includes(newTag.id) ? current : [...current, newTag.id];
      });
    }
  };

  const renderTagButton = (tag: Tag) => {
    if (!tag || !tag.id) return null;

    const isSelected = safeSelectedIds.includes(tag.id);
    const buttonClasses = `${styles.tagItem || "tag-item"} ${
      isSelected ? styles.selectedTagItem || "selected" : ""
    }`;

    return (
      <button
        key={tag.id}
        type="button"
        onClick={() => toggle(tag.id)}
        className={buttonClasses}
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

  if (!styles) return <div>Erro ao carregar estilos das tags.</div>;

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

        {/* Botão de Adicionar (+) */}
        <DialogTrigger>
          <Button className={styles.addTagButtonRound}>+</Button>
          <Popover placement="bottom" className={styles.popoverContainer}>
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path
                  d="M0 12 L6 6 L12 12"
                  fill="white"
                  stroke="#ccc"
                  strokeWidth="1"
                />
              </svg>
            </OverlayArrow>
            <Dialog style={{ outline: "none" }}>
              {({ close }) => (
                <CreateTagModal close={close} onTagCreated={handleTagCreated} />
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
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
            <Link to="/curricular-units" className={styles.emptyUcLink}>
              {t(
                "task:add_ucs_link",
                "Adiciona as tuas UCs na página de Estudo."
              )}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
