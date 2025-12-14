import React from "react";
import { Button, DialogTrigger, Popover } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { RiSettings5Fill } from "react-icons/ri";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import { Tag } from "~/service/service";
import classNames from "classnames";
import { useNavigate } from "@remix-run/react";
import styles from "./TagSection.module.css";

export const TagSection = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  refreshTags,
  setIsEditTagModalOpen,
}: any) => {
  const { t, i18n } = useTranslation(["task"]);
  const navigate = useNavigate();

  const safeTags = Array.isArray(availableTags) ? availableTags : [];
  const safeSelectedIds = Array.isArray(selectedTagIds) ? selectedTagIds : [];

  const customTags = safeTags.filter((tag) => !tag.is_uc);
  const ucTags = safeTags.filter((tag) => tag.is_uc);

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev: string[]) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId];
    });
  };

  const renderTagPill = (tag: Tag) => {
    const isSelected = safeSelectedIds.includes(tag.id);

    let displayName = tag.name_pt;
    if (tag.name && ["fun", "work", "personal", "study"].includes(tag.name)) {
      displayName = t(tag.name);
    } else {
      // Tenta mostrar em inglês se o browser estiver em inglês e existir tradução
      const lang = i18n.language ? i18n.language.toLowerCase() : "pt";
      if (lang.startsWith("en") && tag.name_en) {
        displayName = tag.name_en;
      }
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
        {displayName || "Sem Nome"}
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
