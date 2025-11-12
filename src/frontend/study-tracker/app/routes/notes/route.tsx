import React, { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, service } from "~/service/service";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";

import { RichTextEditor } from "~/components/RichTextEditor/RichTextEditor";
import { useDebouncedCallback } from "use-debounce";

function useCurricularUnitList() {
  const setGlobalError = useSetGlobalError();
  const [cuList, setCuList] = useState<CurricularUnit[]>([]);

  function refreshCurricularUnits() {
    service
      .getCurricularUnits()
      .then((cus: CurricularUnit[]) => setCuList(cus))
      .catch((error) => setGlobalError(error));
  }

  useEffect(() => {
    refreshCurricularUnits();
  }, []);

  return { cuList };
}

function NoteCard({ curricularUnit }: { curricularUnit: CurricularUnit }) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<any>(
    curricularUnit.notes ||
      `<p>${t("Escreve os teus apontamentos para esta cadeira...")}</p>`
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useDebouncedCallback((newContent: any) => {
    setIsSaving(true);
    console.log("A guardar (JSON):", newContent);
    // TODO: guardar na BD
    // service.updateCurricularUnitNotes(curricularUnit.name, newContent)
    //   .then(() => setIsSaving(false))
    //   .catch(() => setIsSaving(false));

    //para a demo:
    setTimeout(() => setIsSaving(false), 1000);
  }, 1500);

  const handleEditorUpdate = (newContent: any) => {
    setNotes(newContent);
    handleSave(newContent);
  };

  return (
    <div className={styles.cardContainer}>
      <h1 className={styles.cardTitle}>{curricularUnit.name}</h1>

      <RichTextEditor content={notes} onUpdate={handleEditorUpdate} />

      <div className={styles.saveStatus}>
        {isSaving
          ? t("notes:saving", "A guardar...")
          : t("notes:saved", "Guardado")}
      </div>
    </div>
  );
}

function NotesPage() {
  const { cuList } = useCurricularUnitList();

  return (
    <div className={styles.pageContainer}>
      {cuList.length > 0 ? (
        cuList.map((cu) => <NoteCard key={cu.name} curricularUnit={cu} />)
      ) : (
        <p>A carregar unidades curriculares...</p>
      )}
    </div>
  );
}

export default function NotesPageAuthControlled() {
  return (
    <RequireAuthn>
      <NotesPage />
    </RequireAuthn>
  );
}
