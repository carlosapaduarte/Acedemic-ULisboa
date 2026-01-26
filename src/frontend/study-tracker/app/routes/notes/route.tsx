import React, { useEffect, useState, useRef, useMemo } from "react";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { CurricularUnit, service } from "~/service/service";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";
import {
  FaFolder,
  FaFilePdf,
  FaFileLines,
  FaArrowLeft,
  FaCloudArrowUp,
  FaEllipsisVertical,
  FaMagnifyingGlass,
  FaXmark,
  FaEye,
  FaTrash,
  FaDownload,
  FaPen,
  FaArrowDownWideShort,
  FaArrowUpWideShort,
} from "react-icons/fa6";
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  Menu,
  MenuItem,
  Popover,
  MenuTrigger,
} from "react-aria-components";

type FileItem = {
  id: string;
  name: string;
  type: "pdf" | "note" | "image";
  date: Date;
  size: number;
  sizeLabel: string;
  url?: string;
};

// MOCK DATA INICIAL
const DEMO_FILES: Record<string, FileItem[]> = {
  default: [
    {
      id: "1",
      name: "Resumo Capítulo 1",
      type: "note",
      date: new Date("2024-01-10"),
      size: 2048,
      sizeLabel: "2 KB",
    },
  ],
};

function NotesPage() {
  const { t } = useTranslation();
  const [ucs, setUcs] = useState<CurricularUnit[]>([]);
  const [currentFolder, setCurrentFolder] = useState<CurricularUnit | null>(
    null,
  );
  const [folderFiles, setFolderFiles] =
    useState<Record<string, FileItem[]>>(DEMO_FILES);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "date" | "size";
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  const totalSpace = 5 * 1024 * 1024 * 1024; // 5GB
  const usedSpace = 2.1 * 1024 * 1024 * 1024; // 2.1GB

  useEffect(() => {
    service.getCurricularUnits().then(setUcs).catch(console.error);
  }, []);

  // --- LOGICA DE UPLOAD ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentFolder) return;

    const objectUrl = URL.createObjectURL(file);
    const sizeMB = file.size / 1024 / 1024;

    const newFile: FileItem = {
      id: Math.random().toString(),
      name: file.name,
      type: file.type.includes("pdf") ? "pdf" : "note",
      date: new Date(),
      size: file.size,
      sizeLabel:
        sizeMB < 1
          ? `${(file.size / 1024).toFixed(0)} KB`
          : `${sizeMB.toFixed(2)} MB`,
      url: objectUrl,
    };

    setFolderFiles((prev) => ({
      ...prev,
      [currentFolder.name]: [...(prev[currentFolder.name] || []), newFile],
    }));

    setIsUploadOpen(false);
  };

  // --- LOGICA DE ORDENAÇÃO E FILTRO ---
  const getSortedFiles = useMemo(() => {
    if (!currentFolder) return [];
    const files = folderFiles[currentFolder.name] || DEMO_FILES["default"];

    return [...files].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [currentFolder, folderFiles, sortConfig]);

  const handleSort = (key: "name" | "date" | "size") => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = (fileId: string) => {
    if (!currentFolder) return;
    if (!confirm("Tem a certeza que deseja apagar este ficheiro?")) return;

    setFolderFiles((prev) => ({
      ...prev,
      [currentFolder.name]: prev[currentFolder.name].filter(
        (f) => f.id !== fileId,
      ),
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column)
      return <span className={styles.sortPlaceholder} />;
    return sortConfig.direction === "asc" ? (
      <FaArrowUpWideShort />
    ) : (
      <FaArrowDownWideShort />
    );
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className={styles.mainTitle}>
            {t("notes:repository_title", "Repositório Académico")}
          </h1>
          <p className={styles.subTitle}>
            {currentFolder ? ` / ${currentFolder.name}` : " / Visão Geral"}
          </p>
        </div>

        <div className={styles.storageWidget}>
          <div className={styles.storageInfo}>
            <span>Armazenamento</span>
            <span>2.1 GB / 5 GB</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: "42%" }}
            ></div>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        {currentFolder ? (
          <button
            className={styles.backButton}
            onClick={() => setCurrentFolder(null)}
          >
            <FaArrowLeft /> {t("common:back", "Voltar")}
          </button>
        ) : (
          <div className={styles.searchBar}>
            <FaMagnifyingGlass className={styles.searchIcon} />
            <input
              placeholder="Procurar em todas as UCs..."
              className={styles.searchInput}
            />
          </div>
        )}

        <div style={{ flex: 1 }}></div>

        {currentFolder && (
          <div className={styles.actions}>
            <DialogTrigger isOpen={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <Button className={styles.primaryButton}>
                <FaCloudArrowUp /> Carregar Ficheiro
              </Button>
              <Modal className={styles.modalOverlay}>
                <Dialog className={styles.modalContent}>
                  {({ close }) => (
                    <>
                      <h2 className={styles.modalTitle}>Carregar Documento</h2>
                      <div
                        className={styles.uploadZone}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaCloudArrowUp
                          size={40}
                          color="var(--primary-color)"
                        />
                        <p>Clique para selecionar um ficheiro</p>
                        <input
                          type="file"
                          hidden
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx"
                        />
                      </div>
                      <div className={styles.modalActions}>
                        <Button
                          onPress={close}
                          className={styles.secondaryButton}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </Dialog>
              </Modal>
            </DialogTrigger>
          </div>
        )}
      </div>

      <div className={styles.contentArea}>
        {!currentFolder ? (
          <div className={styles.gridContainer}>
            {ucs.map((uc) => (
              <div
                key={uc.name}
                className={styles.folderCard}
                onClick={() => setCurrentFolder(uc)}
              >
                <FaFolder className={styles.folderIcon} />
                <span className={styles.folderName}>{uc.name}</span>
                <span className={styles.folderInfo}>Abrir Pasta</span>
              </div>
            ))}
            <div
              className={styles.folderCard}
              onClick={() => alert("Esta pasta é privada.")}
            >
              <FaFolder
                className={styles.folderIcon}
                style={{ color: "#aeb3be" }}
              />
              <span className={styles.folderName}>Pessoal / Docs</span>
              <span className={styles.folderInfo}>Privado</span>
            </div>
          </div>
        ) : (
          <div className={styles.fileList}>
            <div className={styles.fileListHeader}>
              <span
                onClick={() => handleSort("name")}
                className={styles.sortableHeader}
              >
                Nome <SortIcon column="name" />
              </span>
              <span
                onClick={() => handleSort("date")}
                className={styles.sortableHeader}
                style={{ textAlign: "right", justifyContent: "flex-end" }}
              >
                Data <SortIcon column="date" />
              </span>
              <span
                onClick={() => handleSort("size")}
                className={styles.sortableHeader}
                style={{
                  textAlign: "right",
                  paddingRight: "40px",
                  justifyContent: "flex-end",
                }}
              >
                Tamanho <SortIcon column="size" />
              </span>
              <span style={{ width: "40px" }}></span>
            </div>

            {getSortedFiles.map((file) => (
              <div
                key={file.id}
                className={styles.fileRow}
                onClick={() => {
                  if (file.type === "pdf") setPreviewFile(file);
                }}
              >
                <div className={styles.fileIcon}>
                  {file.type === "pdf" ? (
                    <FaFilePdf color="#E53935" size={20} />
                  ) : (
                    <FaFileLines color="#4CAF50" size={20} />
                  )}
                </div>

                <div className={styles.fileNameCell}>
                  <span className={styles.fileName}>{file.name}</span>
                </div>

                <div className={styles.fileDateCell}>
                  {file.date.toLocaleDateString()}
                </div>
                <div className={styles.fileSizeCell}>{file.sizeLabel}</div>

                <div onClick={(e) => e.stopPropagation()}>
                  <MenuTrigger>
                    <Button className={styles.iconButton}>
                      <FaEllipsisVertical />
                    </Button>
                    <Popover
                      placement="bottom end"
                      className={styles.popoverMenu}
                    >
                      <Menu className={styles.actionMenu}>
                        <MenuItem
                          className={styles.actionMenuItem}
                          onAction={() =>
                            alert("Funcionalidade de renomear em breve.")
                          }
                        >
                          <FaPen /> Renomear
                        </MenuItem>
                        <MenuItem
                          className={styles.actionMenuItem}
                          onAction={() => {
                            if (file.url) {
                              const a = document.createElement("a");
                              a.href = file.url;
                              a.download = file.name;
                              a.click();
                            }
                          }}
                        >
                          <FaDownload /> Transferir
                        </MenuItem>
                        <MenuItem
                          className={`${styles.actionMenuItem} ${styles.dangerItem}`}
                          onAction={() => handleDelete(file.id)}
                        >
                          <FaTrash /> Apagar
                        </MenuItem>
                      </Menu>
                    </Popover>
                  </MenuTrigger>
                </div>
              </div>
            ))}

            {getSortedFiles.length === 0 && (
              <div className={styles.emptyState}>
                <p>Pasta vazia. Carrega o teu primeiro documento!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
              <span>{previewFile.name}</span>
              <button onClick={() => setPreviewFile(null)}>
                <FaXmark />
              </button>
            </div>
            <div className={styles.previewContent}>
              <iframe
                src={previewFile.url}
                width="100%"
                height="100%"
                title="PDF Preview"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
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
