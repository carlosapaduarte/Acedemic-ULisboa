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
  const { t } = useTranslation("calendar");

  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#CCCCCC");
  const [description, setDescription] = useState("");

  const fetchAllTags = async () => {
    setIsLoading(true);
    try {
      const tags = await service.fetchUserTags();
      setAllUserTags(tags);
    } catch (error) {
      console.error("Erro ao buscar as tags do utilizador", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllTags();
    } else {
      setTagToEdit(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (tagToEdit) {
      setName(tagToEdit.name);
      setColor(tagToEdit.color || "#CCCCCC");
      setDescription(tagToEdit.description || "");
    } else {
      setName("");
      setColor("#CCCCCC");
      setDescription("");
    }
  }, [tagToEdit]);

  const handleTagSelect = (tag: Tag) => {
    setTagToEdit((prev) => (prev?.id === tag.id ? null : tag));
  };

  const handleSave = async () => {
    if (!name.trim() || !tagToEdit) return;
    setIsSaving(true);
    try {
      await service.updateTag(tagToEdit.id, { name, color, description });
      onTagsUpdate();
      await fetchAllTags();
      setTagToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar a tag:", error);
      alert(t("error_editing_tag"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !tagToEdit ||
      !window.confirm(t("tag_delete_confirmation", { tagName: name }))
    )
      return;
    setIsSaving(true);
    try {
      await service.deleteTag(Number(tagToEdit.id));
      onTagsUpdate();
      await fetchAllTags();
      setTagToEdit(null);
    } catch (error) {
      console.error("Erro ao apagar a tag:", error);
      alert(t("error_deleting_tag", { tagName: name }));
    } finally {
      setIsSaving(false);
    }
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
                allUserTags.map((tag) => (
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
                    {tag.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.editFormColumn}>
            {tagToEdit ? (
              <>
                <div className={styles.editFormContainer}>
                  <TextField className={styles.textField} autoFocus>
                    <Label>{t("tag_name_label")}</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    isDisabled={isSaving}
                  >
                    {t("delete_button")}
                  </Button>
                  <Button
                    onPress={handleSave}
                    className={styles.saveButton}
                    isDisabled={isSaving}
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
