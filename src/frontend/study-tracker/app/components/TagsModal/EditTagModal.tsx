import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";
import { service, Tag } from "~/service/service";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import styles from "./TagModals.module.css";
import classNames from "classnames";

const PREDEFINED_TAG_NAMES = [
  "estudo",
  "study",
  "aula",
  "class",
  "auto-cuidado",
  "self-care",
  "lazer",
  "leisure",
  "projeto",
  "project",
  "pessoal",
  "personal",
];

interface EditTagModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTagsUpdate: () => void;
}

export function EditTagModal({
  isOpen,
  setIsOpen,
  onTagsUpdate,
}: EditTagModalProps) {
  const { t, i18n } = useTranslation("calendar");

  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ucNames, setUcNames] = useState<string[]>([]);

  const [namePt, setNamePt] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [color, setColor] = useState("#CCCCCC");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tags, ucs] = await Promise.all([
        service.fetchUserTags(),
        service.getCurricularUnits(),
      ]);

      setAllUserTags(tags);
      setUcNames(ucs.map((u) => u.name.toLowerCase()));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (tagToEdit) {
      setNamePt(tagToEdit.name_pt || "");
      setNameEn(tagToEdit.name_en || "");
      setColor(tagToEdit.color || "#CCCCCC");
    } else {
      setNamePt("");
      setNameEn("");
      setColor("#CCCCCC");
    }
  }, [tagToEdit]);

  const handleTagSelect = (tag: Tag) => {
    setTagToEdit((prev) => (prev?.id === tag.id ? null : tag));
  };

  const handleSave = async () => {
    if ((!namePt.trim() && !nameEn.trim()) || !tagToEdit) return;
    setIsSaving(true);
    try {
      await service.updateTag(tagToEdit.id, {
        name_pt: namePt,
        name_en: nameEn,
        color: color,
      });
      onTagsUpdate();
      await fetchData();
      setTagToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar a tag:", error);
      alert(t("error_editing_tag"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const lang = i18n.language.toLowerCase();
    const displayName =
      lang.startsWith("en") && tagToEdit?.name_en
        ? tagToEdit.name_en
        : tagToEdit?.name_pt;

    if (
      !tagToEdit ||
      !window.confirm(t("tag_delete_confirmation", { tagName: displayName }))
    )
      return;
    setIsSaving(true);
    try {
      await service.deleteTag(Number(tagToEdit.id));
      onTagsUpdate();
      await fetchData();
      setTagToEdit(null);
    } catch (error) {
      console.error("Erro ao apagar a tag:", error);
      alert(t("error_deleting_tag", { tagName: displayName }));
    } finally {
      setIsSaving(false);
    }
  };

  const isProtectedTag = (tag: Tag | null) => {
    if (!tag) return false;
    const namePt = tag.name_pt?.toLowerCase() || "";
    const nameEn = tag.name_en?.toLowerCase() || "";

    // 1. Verifica se é das predefinidas (Aula, Estudo, etc.)
    if (
      PREDEFINED_TAG_NAMES.includes(namePt) ||
      PREDEFINED_TAG_NAMES.includes(nameEn)
    ) {
      return true;
    }

    // 2. Verifica se o nome corresponde a uma UC existente
    if (ucNames.includes(namePt) || ucNames.includes(nameEn)) {
      return true;
    }

    return false;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={styles.modalOverlay}
    >
      <Dialog
        aria-label={t("edit_tags_title")}
        className={styles.editTagModalContainer}
      >
        <Button
          className={classNames(styles.roundButton, styles.closeButton)}
          onPress={() => setIsOpen(false)}
          isDisabled={isSaving}
        >
          {t("close_button")}
        </Button>
        <h1 className={styles.mainFormModalTitleText}>
          {t("edit_tags_title")}
        </h1>

        <div className={styles.mainContentContainer}>
          <div className={styles.tagListColumn}>
            <div className={styles.tagList}>
              {isLoading ? (
                <p>{t("loading_tags")}...</p>
              ) : (
                allUserTags.map((tag) => {
                  let displayName: string | undefined | null;

                  if (tag.name && PREDEFINED_TAG_NAMES.includes(tag.name)) {
                    displayName = t(`tags:${tag.name}`);
                  } else {
                    const lang = i18n.language.toLowerCase();
                    displayName =
                      lang.startsWith("en") && tag.name_en
                        ? tag.name_en
                        : tag.name_pt;
                  }

                  return (
                    <div
                      key={tag.id}
                      className={classNames(styles.tagItem, {
                        [styles.currentlyEditingTag]: tagToEdit?.id === tag.id,
                      })}
                      style={{ borderColor: tag.color || "#888" }}
                      onClick={() => handleTagSelect(tag)}
                    >
                      <div
                        className={styles.tagColorDot}
                        style={{ backgroundColor: tag.color || "#888" }}
                      />
                      {displayName}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.editFormColumn}>
            {tagToEdit ? (
              <>
                <div className={styles.editFormContainer}>
                  <TextField className={styles.textField} autoFocus>
                    <Label>
                      {t("tag_name_pt_label", "Nome da Etiqueta (PT)")}
                    </Label>
                    <Input
                      value={namePt}
                      onChange={(e) => setNamePt(e.target.value)}
                    />
                  </TextField>

                  <TextField className={styles.textField}>
                    <Label>{t("tag_name_en_label", "Tag Name (EN)")}</Label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                    />
                  </TextField>

                  <ColorPickerInput
                    label={t("tag_color_label")}
                    color={color}
                    setColor={setColor}
                    clearColor={() => setColor("#CCCCCC")}
                  />
                </div>

                <div className={styles.actionButtonsContainer}>
                  <Button
                    onPress={handleDelete}
                    className={styles.deleteButton}
                    isDisabled={isSaving || isProtectedTag(tagToEdit)}
                    style={
                      isSaving || isProtectedTag(tagToEdit)
                        ? {
                            backgroundColor: "#cccccc",
                            color: "#666666",
                            cursor: "not-allowed",
                            opacity: 0.6,
                          }
                        : {}
                    }
                  >
                    {t("delete_button")}
                  </Button>
                  <Button
                    onPress={handleSave}
                    className={styles.saveButton}
                    isDisabled={isSaving || (!namePt.trim() && !nameEn.trim())}
                  >
                    {isSaving ? t("saving_label") : t("save_button")}
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.noTagSelectedMessage}>
                <p>{t("select_a_tag_to_edit")}</p>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </Modal>
  );
}
