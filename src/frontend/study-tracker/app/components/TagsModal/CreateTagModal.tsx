import React, { useState } from "react";
import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import { service } from "~/service/service";
import styles from "./TagModals.module.css";

interface CreateTagModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTagCreated: () => void;
}

export function CreateTagModal({
  isOpen,
  setIsOpen,
  onTagCreated,
}: CreateTagModalProps) {
  const { t } = useTranslation("calendar");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#888888");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setTagName("");
    setTagColor("#888888");
    setError(null);
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!tagName.trim()) {
      setError("O nome da tag não pode estar vazio.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await service.createTag({ name: tagName, color: tagColor });
      onTagCreated();
      handleClose();
    } catch (err: any) {
      console.error("Erro ao criar tag:", err);
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose}>
      <Dialog className={styles.tagModal}>
        <h3 className={styles.title}>
          {t("new_tag_modal_title", "Criar Nova Etiqueta")}
        </h3>
        <TextField
          className={styles.textField}
          value={tagName}
          onChange={setTagName}
          autoFocus
        >
          <Label>{t("tag_name_label", "Nome da Etiqueta")}</Label>
          <Input
            placeholder={t("new_tag_name_placeholder", "Nome da nova etiqueta")}
          />
        </TextField>
        <ColorPickerInput
          label={t("tag_color_label", "Cor da Etiqueta")}
          color={tagColor}
          setColor={setTagColor}
          clearColor={() => setTagColor("")}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button
          className={styles.saveButton}
          onPress={handleSave}
          isDisabled={isSaving}
        >
          {isSaving
            ? t("saving_button", "A Guardar...")
            : t("create_button", "Criar")}
        </Button>
      </Dialog>
    </Modal>
  );
}
