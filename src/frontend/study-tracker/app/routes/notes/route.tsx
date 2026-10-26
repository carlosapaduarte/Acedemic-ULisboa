import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { ArchiveItem, FileItem, service } from "~/service/service";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";
import { useAppFeedback } from "~/components/error/GlobalErrorContainer";
import React, { useEffect, useState, startTransition } from "react";
import { RichTextEditor } from "~/components/RichTextEditor/RichTextEditor";

import {
  FaFolder,
  FaArrowLeft,
  FaCloudArrowUp,
  FaEllipsisVertical,
  FaMagnifyingGlass,
  FaXmark,
  FaTrash,
  FaPen,
  FaFolderPlus,
  FaFileCirclePlus,
  FaNoteSticky,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaLink
} from "react-icons/fa6";
import {
  Button,
  Dialog,
  Modal,
  Menu,
  MenuItem,
  Popover,
  MenuTrigger,
} from "react-aria-components";

export const handle = {
  i18n: ["notes", "task"],
};

const validateAndFormatUrl = (url: string) => {
  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }
  try {
    new URL(formattedUrl);
    return formattedUrl;
  } catch {
    return null;
  }
};

function NotesPage() {
  const { t } = useTranslation(["notes", "task", "common"]);
  const { confirmAction, notify } = useAppFeedback();
  const [isClient, setIsClient] = useState(false);
  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const [rootArchives, setRootArchives] = useState<ArchiveItem[]>([]);
  const [folderPath, setFolderPath] = useState<ArchiveItem[]>([]);
  const currentFolder =
    folderPath.length > 0 ? folderPath[folderPath.length - 1] : null;

  const [searchQuery, setSearchQuery] = useState("");
  
  // ESTADOS DOS MODAIS E ERROS
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState("");

  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newTextFileName, setNewTextFileName] = useState("");
  const [fileError, setFileError] = useState("");

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkName, setNewLinkName] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkErrorField, setLinkErrorField] = useState<"title" | "url" | null>(null);

  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [textContent, setTextContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // RENOMEAR
  const [renameTarget, setRenameTarget] = useState<{
    id: number;
    type: "file" | "folder";
    currentName: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  const loadData = () => {
    Promise.all([service.getArchives(), service.getRootFiles()])
      .then(([data, rootFilesData]) => {
        setRootArchives(data);
        setRootFiles(rootFilesData);

        if (folderPath.length > 0) {
          const currentId = folderPath[folderPath.length - 1].id;
          const findFolder = (list: ArchiveItem[]): ArchiveItem | null => {
            for (const item of list) {
              if (item.id === currentId) return item;
              const sub = findFolder(item.sub_archives);
              if (sub) return sub;
            }
            return null;
          };
          const updated = findFolder(data);
          if (updated) setFolderPath((prev) => [...prev.slice(0, -1), updated]);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const fileIdToOpen = urlParams.get("openFile");
        if (fileIdToOpen) {
          let found: FileItem | null =
            rootFilesData.find((f) => f.id.toString() === fileIdToOpen) || null;
          const search = (list: ArchiveItem[]) => {
            for (const a of list) {
              const match = a.files.find(
                (f) => f.id.toString() === fileIdToOpen,
              );
              if (match) {
                found = match;
                break;
              }
              search(a.sub_archives);
            }
          };
          if (!found) search(data);
          if (found) {
            openTextEditor(found);
            window.history.replaceState({}, "", window.location.pathname);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  // AUTO-SAVE DA NOTA
  useEffect(() => {
    if (!editingFile || !isClient) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      service
        .updateFileText(editingFile.id, textContent)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, 1500);
    return () => clearTimeout(timer);
  }, [editingFile?.id, isClient, textContent]);

  const openTextEditor = (file: FileItem) => {
    startTransition(() => {
      setEditingFile(file);
      setTextContent(file.text || "");
      setSaveStatus("saved");
    });

    try {
      const recent = JSON.parse(localStorage.getItem("recent_notes") || "[]");
      const updated = recent.filter((n: any) => n.id !== file.id);
      const folderName = currentFolder ? currentFolder.name : "";

      updated.unshift({
        id: file.id,
        fileName: file.name,
        folderName: folderName,
        isRootFolder: currentFolder === null,
      });

      localStorage.setItem("recent_notes", JSON.stringify(updated.slice(0, 3)));
    } catch (e) {
      console.error("Erro ao guardar no histórico:", e);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setFolderError("folder_name_required");
      return;
    }
    setFolderError("");
    try {
      await service.createArchive(newFolderName.trim(), currentFolder?.id || null);
      closeFolderModal();
      loadData();
    } catch (e: any) {
      setFolderError("create_folder_error");
    }
  };

  const handleCreateFile = async () => {
    if (!newTextFileName.trim()) {
      setFileError("new_note_title_required");
      return;
    }
    setFileError("");
    try {
      await service.createFile(currentFolder?.id || null, newTextFileName.trim(), "note", "");
      closeFileModal();
      loadData();
    } catch (e: any) {
      setFileError("new_note_error");
    }
  };

  const handleCreateLink = async () => {
    if (!newLinkName.trim()) {
      setLinkError("link_title_required");
      setLinkErrorField("title");
      return;
    }
    if (!newLinkUrl.trim()) {
      setLinkError("link_url_required");
      setLinkErrorField("url");
      return;
    }

    const validUrl = validateAndFormatUrl(newLinkUrl);
    if (!validUrl) {
      setLinkError("link_url_invalid");
      setLinkErrorField("url");
      return;
    }

    setLinkError("");
    setLinkErrorField(null);
    try {
      await service.createFile(currentFolder?.id || null, newLinkName.trim(), "link", validUrl);
      closeLinkModal();
      loadData();
    } catch (e: any) {
      setLinkError("create_link_error");
      setLinkErrorField(null);
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    if (!renameValue.trim()) {
      setRenameError("rename_name_required");
      return;
    }
    setRenameError("");
    try {
      if (renameTarget.type === "folder") {
        await service.renameArchive(renameTarget.id, renameValue.trim());
      } else {
        await service.renameFile(renameTarget.id, renameValue.trim());
      }
      closeRenameModal();
      loadData();
    } catch (e) {
      setRenameError("rename_error");
    }
  };

  const closeFolderModal = () => {
    setIsCreateFolderOpen(false);
    setNewFolderName("");
    setFolderError("");
  };

  const closeFileModal = () => {
    setIsCreateFileOpen(false);
    setNewTextFileName("");
    setFileError("");
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setNewLinkUrl("");
    setNewLinkName("");
    setLinkError("");
    setLinkErrorField(null);
  };

  const closeRenameModal = () => {
    setRenameTarget(null);
    setRenameValue("");
    setRenameError("");
  };

  const handleDeleteFile = async (id: number) => {
    const confirmed = await confirmAction({
      title: t("common:confirmation_title"),
      message: t("notes:delete_file_confirm"),
      cancelLabel: t("common:cancel"),
      confirmLabel: t("notes:delete"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await service.deleteFile(id);
      loadData();
    } catch {
      notify({ type: "error", message: t("notes:delete_file_error") });
    }
  };

  const handleDeleteFolder = async (id: number) => {
    const confirmed = await confirmAction({
      title: t("common:confirmation_title"),
      message: t("notes:delete_folder_confirm"),
      cancelLabel: t("common:cancel"),
      confirmLabel: t("notes:delete"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await service.deleteArchive(id);
      loadData();
    } catch {
      notify({ type: "error", message: t("notes:delete_folder_error") });
    }
  };

  const isSearching = searchQuery.trim().length > 0;
  
  const handleFolderClick = (clickedFolder: ArchiveItem) => {
    if (isSearching) {
      const findPath = (targetId: number, list: ArchiveItem[], currentPath: ArchiveItem[] = []): ArchiveItem[] | null => {
        for (const item of list) {
          const path = [...currentPath, item];
          if (item.id === targetId) return path;
          const found = findPath(targetId, item.sub_archives, path);
          if (found) return found;
        }
        return null;
      };

      const fullPath = findPath(clickedFolder.id, rootArchives);
      if (fullPath) {
        setFolderPath(fullPath);
      } else {
        setFolderPath([clickedFolder]);
      }
      setSearchQuery(""); 
    } else {
      setFolderPath([...folderPath, clickedFolder]);
    }
  };
  
  const getAllArchives = (list: ArchiveItem[]): ArchiveItem[] => {
    let res: ArchiveItem[] = [];
    list.forEach((a) => {
      res.push(a);
      res = res.concat(getAllArchives(a.sub_archives));
    });
    return res;
  };

  const getAllFiles = (list: ArchiveItem[]): FileItem[] => {
    let res: FileItem[] = [];
    list.forEach((a) => {
      res = res.concat(a.files);
      res = res.concat(getAllFiles(a.sub_archives));
    });
    return res;
  };

  const archivesToShow = isSearching
    ? getAllArchives(rootArchives)
    : currentFolder
    ? currentFolder.sub_archives
    : rootArchives;

  const filesToShow = isSearching
    ? getAllFiles(rootArchives)
    : currentFolder
    ? currentFolder.files
    : rootFiles;

  const getFileIcon = (file: FileItem) => {
    const isLink = file.file_type === "link" || (file.text && file.text.startsWith("http"));
    if (!isLink) return <FaNoteSticky color="var(--color-3)" size={20} style={{ marginRight: "12px", flexShrink: 0 }} />;
    
    const url = file.text?.toLowerCase() || "";
    if (url.includes("docs.google.com/spreadsheets") || url.includes("excel")) {
      return <FaFileExcel color="var(--color-3)" size={20} style={{ marginRight: "12px", flexShrink: 0 }} />;
    }
    if (url.includes("docs.google.com/presentation") || url.includes("powerpoint") || url.includes("slides")) {
      return <FaFilePowerpoint color="var(--color-3)" size={20} style={{ marginRight: "12px", flexShrink: 0 }} />;
    }
    if (url.includes("docs.google.com/document") || url.includes("word")) {
      return <FaFileWord color="var(--color-3)" size={20} style={{ marginRight: "12px", flexShrink: 0 }} />;
    }
    return <FaLink color="var(--color-3)" size={20} style={{ marginRight: "12px", flexShrink: 0 }} />;
  };

  if (editingFile) {
    return (
      <div className={`${styles.pageContainer} ${styles.editorPage}`}>
        <header
          className={styles.editorHeader}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "15px",
            borderBottom: "2px solid var(--color-3)",
            color: "var(--color-3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={() => {
                setEditingFile(null);
                loadData();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--color-3)",
                textTransform: "uppercase",
                fontSize: "0.95rem"
              }}
            >
              <FaArrowLeft aria-hidden="true" /> {t("notes:back")}
            </button>
            <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "800", textTransform: "uppercase" }}>
              {editingFile.name}
            </h1>
          </div>
          <span style={{ fontSize: "0.9rem", fontWeight: "700", opacity: 0.8 }}>
            {t(`notes:${saveStatus === "error" ? "save_error" : saveStatus}`)}
          </span>
        </header>
        <div className={styles.editorWorkspace}>
          {isClient && (
            <RichTextEditor key={editingFile.id} content={textContent} onUpdate={setTextContent} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>
          {t("notes:repository_title")}
        </h1>
        <p className={styles.subTitle}>
          {folderPath.length === 0
            ? t("notes:root")
            : folderPath.length <= 2
            ? folderPath.map((f) => f.name).join(" > ")
            : `${folderPath[0].name} > ... > ${folderPath[folderPath.length - 1].name}`}
        </p>
      </header>

      <div className={styles.toolbar}>
        {currentFolder && !isSearching ? (
          <button
            className={styles.backButton}
            onClick={() => setFolderPath((prev) => prev.slice(0, -1))}
          >
            <FaArrowLeft aria-hidden="true" /> {t("notes:back")}
          </button>
        ) : (
          <div className={styles.searchBar}>
            <FaMagnifyingGlass className={styles.searchIcon} />
            <input
              placeholder={t("notes:search_placeholder")}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        <div style={{ flex: 1 }} />
        
        <div className={styles.actions}>
          <Button className={styles.secondaryButton} onPress={() => setIsCreateFolderOpen(true)}>
            <FaFolderPlus aria-hidden="true" /> {t("notes:create_folder_button")}
          </Button>
          <Button className={styles.secondaryButton} onPress={() => setIsLinkModalOpen(true)}>
            <FaCloudArrowUp aria-hidden="true" /> {t("notes:create_link_button")}
          </Button>
          <Button className={styles.primaryButton} onPress={() => setIsCreateFileOpen(true)}>
            <FaFileCirclePlus aria-hidden="true" /> {t("notes:create_note_button")}
          </Button>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.gridContainer}>
          {archivesToShow
            .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((archive) => (
              <div key={archive.id} className={styles.folderCard} onClick={() => handleFolderClick(archive)}>
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={t("notes:rename_folder", { name: archive.name })}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTarget({ id: archive.id, type: "folder", currentName: archive.name });
                      setRenameValue(archive.name);
                    }}
                  >
                    <FaPen size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={t("notes:delete_folder", { name: archive.name })}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(archive.id);
                    }}
                  >
                    <FaXmark size={16} aria-hidden="true" />
                  </button>
                </div>
                <FaFolder className={styles.folderIcon} />
                <span className={styles.folderName}>{archive.name}</span>
              </div>
            ))}
        </div>

        <div className={styles.fileList} style={{ marginTop: "20px" }}>
          {filesToShow
            .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((file) => (
              <div
                key={file.id}
                className={styles.fileRow}
                onClick={() => {
                  const isLink = file.file_type === "link" || (file.text && file.text.startsWith("http"));
                  if (isLink) {
                    window.open(file.text, "_blank"); 
                  } else {
                    openTextEditor(file);
                  }
                }}
              >
                {getFileIcon(file)}
                <span className={styles.fileName} style={{ flex: 1 }}>{file.name}</span>
                <MenuTrigger>
                  <Button className={styles.iconButton} style={{ opacity: 1, padding: "8px" }} aria-label={t("notes:file_actions", { name: file.name })}>
                    <FaEllipsisVertical aria-hidden="true" />
                  </Button>
                  <Popover className={styles.popoverMenu}>
                    <Menu
                      onAction={(key) => {
                        if (key === "rename") {
                          setRenameTarget({ id: file.id, type: "file", currentName: file.name });
                          setRenameValue(file.name);
                        }
                        if (key === "delete") handleDeleteFile(file.id);
                      }}
                    >
                      <MenuItem id="rename" className={styles.actionMenuItem}>
                        <FaPen aria-hidden="true" /> {t("notes:rename")}
                      </MenuItem>
                      <MenuItem id="delete" className={`${styles.actionMenuItem} ${styles.dangerItem}`}>
                        <FaTrash aria-hidden="true" /> {t("notes:delete")}
                      </MenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL CRIAR PASTA */}
      <Modal isOpen={isCreateFolderOpen} onOpenChange={(isOpen) => !isOpen && closeFolderModal()} className={styles.modalOverlay}>
        <Dialog className={`${styles.modalContent} ${styles.noteModalContent} ${styles.actionModalContent}`} aria-label={t("notes:create_folder_aria")}>
          <button onClick={closeFolderModal} className={styles.modalCloseButton} aria-label={t("task:close")}>
            <FaXmark aria-hidden="true" />
          </button>
          <h2 className={`${styles.modalTitle} ${styles.noteModalTitle} ${styles.actionModalTitle}`}>{t("notes:new_folder_title")}</h2>
          <div className={styles.modalFieldGroup}>
            <label className={styles.modalFieldLabel} htmlFor="notes-folder-name">
              {t("notes:folder_name_label")}
            </label>
            <input
              id="notes-folder-name"
              className={`${styles.modalInput} ${styles.noteModalInput} ${folderError ? styles.inputError : ''}`}
              value={newFolderName}
              onChange={(e) => { setNewFolderName(e.target.value); setFolderError(""); }}
            />
          </div>
          {folderError && <p className={styles.errorText}>{t(`notes:${folderError}`)}</p>}
          <Button className={`${styles.primaryButton} ${styles.noteModalButton}`} style={{ width: "100%", justifyContent: "center" }} onPress={handleCreateFolder}>{t("notes:create")}</Button>
        </Dialog>
      </Modal>

      {/* MODAL CRIAR NOTA (TXT) */}
      <Modal isOpen={isCreateFileOpen} onOpenChange={(isOpen) => !isOpen && closeFileModal()} className={styles.modalOverlay}>
        <Dialog
          className={`${styles.modalContent} ${styles.noteModalContent}`}
          style={{ position: "relative" }}
          aria-label={t("notes:new_note_title")}
        >
          <button onClick={closeFileModal} className={styles.modalCloseButton} aria-label={t("task:close")}>
            <FaXmark aria-hidden="true" />
          </button>
          <h2 className={`${styles.modalTitle} ${styles.noteModalTitle}`}>
            {t("notes:new_note_title")}
          </h2>
          <input
            placeholder={t("notes:new_note_placeholder")}
            className={`${styles.modalInput} ${styles.noteModalInput} ${fileError ? styles.inputError : ''}`}
            value={newTextFileName}
            onChange={(e) => { setNewTextFileName(e.target.value); setFileError(""); }}
          />
          {fileError && <p className={styles.errorText}>{t(`notes:${fileError}`)}</p>}
          <Button
            className={`${styles.primaryButton} ${styles.noteModalButton}`}
            style={{ width: "100%", justifyContent: "center" }}
            onPress={handleCreateFile}
          >
            {t("notes:create_note")}
          </Button>
        </Dialog>
      </Modal>

      {/* MODAL CRIAR LINK */}
      <Modal isOpen={isLinkModalOpen} onOpenChange={(isOpen) => !isOpen && closeLinkModal()} className={styles.modalOverlay}>
        <Dialog className={`${styles.modalContent} ${styles.noteModalContent} ${styles.actionModalContent}`} aria-label={t("notes:create_link_aria")}>
          <button onClick={closeLinkModal} className={styles.modalCloseButton} aria-label={t("task:close")}>
            <FaXmark aria-hidden="true" />
          </button>
          <h2 className={`${styles.modalTitle} ${styles.noteModalTitle} ${styles.actionModalTitle}`}>{t("notes:new_link_title")}</h2>
          <div className={styles.modalFieldGroup}>
            <label className={styles.modalFieldLabel} htmlFor="notes-link-title">
              {t("notes:link_title_label")}
            </label>
            <input
              id="notes-link-title"
              placeholder={t("notes:link_title_placeholder")}
              className={`${styles.modalInput} ${styles.noteModalInput} ${linkErrorField === "title" ? styles.inputError : ''}`}
              value={newLinkName}
              onChange={(e) => { setNewLinkName(e.target.value); setLinkError(""); setLinkErrorField(null); }}
            />
          </div>
          <div className={styles.modalFieldGroup}>
            <label className={styles.modalFieldLabel} htmlFor="notes-link-url">
              {t("notes:link_url_label")}
            </label>
            <input
              id="notes-link-url"
              placeholder={t("notes:link_url_placeholder")}
              className={`${styles.modalInput} ${styles.noteModalInput} ${linkErrorField === "url" ? styles.inputError : ''}`}
              value={newLinkUrl}
              onChange={(e) => { setNewLinkUrl(e.target.value); setLinkError(""); setLinkErrorField(null); }}
            />
          </div>
          {linkError && <p className={styles.errorText}>{t(`notes:${linkError}`)}</p>}
          <Button className={`${styles.primaryButton} ${styles.noteModalButton}`} style={{ width: "100%", justifyContent: "center" }} onPress={handleCreateLink}>{t("notes:add")}</Button>
        </Dialog>
      </Modal>

      {/* MODAL RENOMEAR */}
      <Modal isOpen={!!renameTarget} onOpenChange={(isOpen) => !isOpen && closeRenameModal()} className={styles.modalOverlay}>
        <Dialog className={`${styles.modalContent} ${styles.noteModalContent} ${styles.actionModalContent}`} aria-label={t("notes:rename_item_aria")}>
          <button onClick={closeRenameModal} className={styles.modalCloseButton} aria-label={t("task:close")}>
            <FaXmark aria-hidden="true" />
          </button>
          <h2 className={`${styles.modalTitle} ${styles.noteModalTitle} ${styles.actionModalTitle}`}>{t("notes:rename")}</h2>
          <div className={styles.modalFieldGroup}>
            <label className={styles.modalFieldLabel} htmlFor="notes-rename-name">
              {t("notes:rename_name_label")}
            </label>
            <input
              id="notes-rename-name"
              className={`${styles.modalInput} ${styles.noteModalInput} ${renameError ? styles.inputError : ''}`}
              value={renameValue}
              onChange={(e) => { setRenameValue(e.target.value); setRenameError(""); }}
            />
          </div>
          {renameError && <p className={styles.errorText}>{t(`notes:${renameError}`)}</p>}
          <Button className={`${styles.primaryButton} ${styles.noteModalButton}`} style={{ width: "100%", justifyContent: "center" }} onPress={handleRenameSubmit}>{t("notes:save_action")}</Button>
        </Dialog>
      </Modal>
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
