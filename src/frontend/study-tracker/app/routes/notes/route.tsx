import React, { useEffect, useState, useRef } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { CurricularUnit, service } from "~/service/service";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";

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
  const [notes, setNotes] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes]);

  function handleSave() {
    console.log("A guardar notas (ainda não implementado):", notes);
  }

  return (
    <div className={styles.cardContainer}>
      <h1 className={styles.cardTitle}>{curricularUnit.name}</h1>
      <textarea
        ref={textareaRef}
        className={styles.notesTextarea}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("Escreve os teus apontamentos para esta cadeira...")}
        rows={1}
      />
      <button className={styles.button} onClick={handleSave} disabled={true}>
        Guardar Apontamentos (Brevemente)
      </button>
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
