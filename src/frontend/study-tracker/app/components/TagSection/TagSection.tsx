import React from "react";
import { Button, DialogTrigger, Popover } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { RiSettings5Fill } from "react-icons/ri";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import { Tag } from "~/service/service";
import classNames from "classnames";
import { useNavigate } from "@remix-run/react";
import styles from "./tagSection.module.css";

export const TagSection = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  refreshTags,
  setIsEditTagModalOpen,
}: {
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags: Tag[];
  refreshTags: () => void;
  setIsEditTagModalOpen: (isOpen: boolean) => void;
}) => {
  const { t, i18n } = useTranslation(["task"]);
  const navigate = useNavigate();

  const safeTags = Array.isArray(availableTags)
    ? availableTags.filter((t) => t && typeof t === "object" && "id" in t)
    ? availableTags.filter((tag) => tag !== null && tag !== undefined)
    : [];

  const safeSelectedIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];

  if (safeTags.length === 0) {
    console.warn("A lista de tags está vazia após a limpeza.");
  }

  const customTags = safeTags.filter((tag) => !tag.is_uc);
  const ucTags = safeTags.filter((tag) => tag.is_uc);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.includes(tagId)
        ? safePrev.filter((id) => id !== tagId)
        : [...safePrev, tagId];
    });
  };

  const renderTagPill = (tag: Tag) => {
    const isSelected = safeSelectedIds.includes(tag.id);
    let displayName: string | undefined | null;

    if (tag.name && ["fun", "work", "personal", "study"].includes(tag.name)) {
      displayName = t(tag.name);
    } else {
      const lang = i18n.language.toLowerCase();
      displayName =
        lang.startsWith("en") && tag.name_en ? tag.name_en : tag.name_pt;
    }

    return (
      <div
        key={tag.id}
        className={classNames(styles.tagItem, {
          [styles.selectedTagItem]: isSelected,
        })}
        onClick={() => handleToggleTag(tag.id)}
        style={{
          backgroundColor: isSelected && tag.color ? tag.color : undefined,
        }}
      >
        {displayName}
      </div>
    );
  };

  return (
    <div className={styles.tagsSectionContainer}>
      <div className={styles.tagsHeader}>
        <h2 className={styles.formSectionTitle}>
          {t("tags_title", "Etiquetas")}
        </h2>
        <div className={styles.tagButtonsContainer}>
          <Button
            onPress={() => setIsEditTagModalOpen(true)}
            className={styles.headerButton}
            aria-label={t("manage_tags", "Gerir etiquetas")}
          >
            <RiSettings5Fill size={18} />
          </Button>
        </div>
      </div>

      <div className={styles.tagsBox}>
        {customTags.map(renderTagPill)}

        <DialogTrigger>
          <Button className={styles.addTagButtonRound}>+</Button>
          <Popover placement="bottom">
            <CreateTagModal onTagCreated={refreshTags} />
          </Popover>
        </DialogTrigger>
      </div>

      <div className={styles.ucTagsContainer}>
        <div className={styles.ucTagsLabel}>AULAS / UCS</div>

        {ucTags.length > 0 ? (
          <div className={styles.ucTagsList}>{ucTags.map(renderTagPill)}</div>
        ) : (
          <p className={styles.emptyUcText}>
            {t("task:no_ucs_text", "Ainda não tens UCs associadas.")}{" "}
            <span
              className={styles.emptyUcLink}
              onClick={() => navigate("/study")}
            >
              {t(
                "task:add_ucs_link",
                "Adiciona as tuas UCs na página de Estudo."
              )}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
