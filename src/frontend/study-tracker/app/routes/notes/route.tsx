import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { ArchiveItem, FileItem, service } from "~/service/service";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [textContent, setTextContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "Guardado" | "A guardar..." | "Erro"
  >("Guardado");

  // RENOMEAR
  const [renameTarget, setRenameTarget] = useState<{
    id: number;
    type: "file" | "folder";
    currentName: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  const loadData = () => {
    service
      .getArchives()
      .then((data) => {
        setRootArchives(data);

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
          let found: FileItem | null = null;
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
          search(data);
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
    setSaveStatus("A guardar...");
    const timer = setTimeout(() => {
      service
        .updateFileText(editingFile.id, textContent)
        .then(() => setSaveStatus("Guardado"))
        .catch(() => setSaveStatus("Erro"));
    }, 1500);
    return () => clearTimeout(timer);
  }, [textContent]);

  const openTextEditor = (file: FileItem) => {
    startTransition(() => {
      setEditingFile(file);
      setTextContent(file.text || "");
      setSaveStatus("Guardado");
    });

    try {
      const recent = JSON.parse(localStorage.getItem("recent_notes") || "[]");
      const updated = recent.filter((n: any) => n.id !== file.id);
      const folderName = currentFolder ? currentFolder.name : "Raiz";

      updated.unshift({
        id: file.id,
        fileName: file.name,
        folderName: folderName,
      });

      localStorage.setItem("recent_notes", JSON.stringify(updated.slice(0, 3)));
    } catch (e) {
      console.error("Erro ao guardar no histórico:", e);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setFolderError("O nome da pasta não pode estar vazio.");
      return;
    }
    setFolderError("");
    try {
      await service.createArchive(newFolderName.trim(), currentFolder?.id || null);
      closeFolderModal();
      loadData();
    } catch (e: any) {
      setFolderError(e.message || "Erro ao criar pasta.");
    }
  };

  const handleCreateFile = async () => {
    if (!newTextFileName.trim()) {
      setFileError("O título da nota não pode estar vazio.");
      return;
    }
    setFileError("");
    try {
      await service.createFile(currentFolder?.id || null, newTextFileName.trim(), "note", "");
      closeFileModal();
      loadData();
    } catch (e: any) {
      setFileError(e.message || "Erro ao criar nota.");
    }
  };

  const handleCreateLink = async () => {
    if (!newLinkName.trim()) {
      setLinkError("Por favor, insere um título para o link.");
      return;
    }
    if (!newLinkUrl.trim()) {
      setLinkError("A URL não pode estar vazia.");
      return;
    }

    const validUrl = validateAndFormatUrl(newLinkUrl);
    if (!validUrl) {
      setLinkError("Formato de URL inválido. Exemplo: www.google.com");
      return;
    }

    setLinkError("");
    try {
      await service.createFile(currentFolder?.id || null, newLinkName.trim(), "link", validUrl);
      closeLinkModal();
      loadData();
    } catch (e: any) {
      setLinkError(e.message || "Erro ao guardar o link.");
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    if (!renameValue.trim()) {
      setRenameError("O nome não pode estar vazio.");
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
      setRenameError("Erro ao renomear o item.");
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
  };

  const closeRenameModal = () => {
    setRenameTarget(null);
    setRenameValue("");
    setRenameError("");
  };

  const handleDeleteFile = async (id: number) => {
    if (confirm("Apagar ficheiro?")) {
      await service.deleteFile(id);
      loadData();
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (confirm("Apagar pasta e todo o seu conteúdo?")) {
      await service.deleteArchive(id);
      loadData();
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
      <div className={styles.pageContainer}>
        <header
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
              <FaArrowLeft /> Voltar
            </button>
            <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "800", textTransform: "uppercase" }}>
              {editingFile.name}
            </h1>
          </div>
          <span style={{ fontSize: "0.9rem", fontWeight: "700", opacity: 0.8 }}>
            {saveStatus}
          </span>
        </header>
        <div style={{ flex: 1, marginTop: "20px" }}>
          {isClient && (
            <RichTextEditor content={textContent} onUpdate={setTextContent} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>
          {t("notes:repository_title", "Apontamentos")}
        </h1>
        <p className={styles.subTitle}>
          {folderPath.length === 0
            ? "Raiz"
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
            <FaArrowLeft /> Voltar
          </button>
        ) : (
          <div className={styles.searchBar}>
            <FaMagnifyingGlass className={styles.searchIcon} />
            <input
              placeholder="Procurar..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        <div style={{ flex: 1 }} />
        
        <div className={styles.actions}>
          <Button className={styles.secondaryButton} onPress={() => setIsCreateFolderOpen(true)}>
            <FaFolderPlus /> Pasta
          </Button>
          <Button className={styles.secondaryButton} onPress={() => setIsLinkModalOpen(true)}>
            <FaCloudArrowUp /> Link
          </Button>
          <Button className={styles.primaryButton} onPress={() => setIsCreateFileOpen(true)}>
            <FaFileCirclePlus /> Nota
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
                  <FaPen
                    size={14}
                    className={styles.iconButton}
                    style={{ padding: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTarget({ id: archive.id, type: "folder", currentName: archive.name });
                      setRenameValue(archive.name);
                    }}
                  />
                  <FaXmark
                    size={16}
                    className={styles.iconButton}
                    style={{ padding: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(archive.id);
                    }}
                  />
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
                  <Button className={styles.iconButton} style={{ opacity: 1, padding: "8px" }}>
                    <FaEllipsisVertical />
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
                        <FaPen /> Renomear
                      </MenuItem>
                      <MenuItem id="delete" className={`${styles.actionMenuItem} ${styles.dangerItem}`}>
                        <FaTrash /> Apagar
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
        <Dialog className={styles.modalContent} style={{ position: "relative" }} aria-label="Criar Nova Pasta">
          <button onClick={closeFolderModal} className={styles.iconButton} style={{ position: "absolute", top: "15px", right: "15px", opacity: 1 }}>
            <FaXmark size={18} />
          </button>
          <h2 className={styles.modalTitle}>Nova Pasta</h2>
          <input
            placeholder="Nome da pasta"
            className={`${styles.modalInput} ${folderError ? styles.inputError : ''}`}
            value={newFolderName}
            onChange={(e) => { setNewFolderName(e.target.value); setFolderError(""); }}
          />
          {folderError && <p className={styles.errorText}>{folderError}</p>}
          <Button className={styles.primaryButton} style={{ width: "100%", justifyContent: "center" }} onPress={handleCreateFolder}>Criar</Button>
        </Dialog>
      </Modal>

      {/* MODAL CRIAR NOTA (TXT) */}
      <Modal isOpen={isCreateFileOpen} onOpenChange={(isOpen) => !isOpen && closeFileModal()} className={styles.modalOverlay}>
        <Dialog className={styles.modalContent} style={{ position: "relative" }} aria-label="Criar Nova Nota">
          <button onClick={closeFileModal} className={styles.iconButton} style={{ position: "absolute", top: "15px", right: "15px", opacity: 1 }}>
            <FaXmark size={18} />
          </button>
          <h2 className={styles.modalTitle}>Nova Nota</h2>
          <input
            placeholder="Ex: Resumo Aula 1"
            className={`${styles.modalInput} ${fileError ? styles.inputError : ''}`}
            value={newTextFileName}
            onChange={(e) => { setNewTextFileName(e.target.value); setFileError(""); }}
          />
          {fileError && <p className={styles.errorText}>{fileError}</p>}
          <Button className={styles.primaryButton} style={{ width: "100%", justifyContent: "center" }} onPress={handleCreateFile}>Criar</Button>
        </Dialog>
      </Modal>

      {/* MODAL CRIAR LINK */}
      <Modal isOpen={isLinkModalOpen} onOpenChange={(isOpen) => !isOpen && closeLinkModal()} className={styles.modalOverlay}>
        <Dialog className={styles.modalContent} style={{ position: "relative" }} aria-label="Adicionar Link Externo">
          <button onClick={closeLinkModal} className={styles.iconButton} style={{ position: "absolute", top: "15px", right: "15px", opacity: 1 }}>
            <FaXmark size={18} />
          </button>
          <h2 className={styles.modalTitle}>Novo Link</h2>
          <input
            placeholder="Título (ex: Slides Prática)"
            className={`${styles.modalInput} ${linkError.includes("título") ? styles.inputError : ''}`}
            value={newLinkName}
            onChange={(e) => { setNewLinkName(e.target.value); setLinkError(""); }}
          />
          <input
            placeholder="URL (ex: www.site.com/link)"
            className={`${styles.modalInput} ${linkError.includes("URL") ? styles.inputError : ''}`}
            value={newLinkUrl}
            onChange={(e) => { setNewLinkUrl(e.target.value); setLinkError(""); }}
          />
          {linkError && <p className={styles.errorText}>{linkError}</p>}
          <Button className={styles.primaryButton} style={{ width: "100%", justifyContent: "center" }} onPress={handleCreateLink}>Adicionar</Button>
        </Dialog>
      </Modal>

      {/* MODAL RENOMEAR */}
      <Modal isOpen={!!renameTarget} onOpenChange={(isOpen) => !isOpen && closeRenameModal()} className={styles.modalOverlay}>
        <Dialog className={styles.modalContent} style={{ position: "relative" }} aria-label="Renomear Item">
          <button onClick={closeRenameModal} className={styles.iconButton} style={{ position: "absolute", top: "15px", right: "15px", opacity: 1 }}>
            <FaXmark size={18} />
          </button>
          <h2 className={styles.modalTitle}>Renomear</h2>
          <input
            className={`${styles.modalInput} ${renameError ? styles.inputError : ''}`}
            value={renameValue}
            onChange={(e) => { setRenameValue(e.target.value); setRenameError(""); }}
          />
          {renameError && <p className={styles.errorText}>{renameError}</p>}
          <Button className={styles.primaryButton} style={{ width: "100%", justifyContent: "center" }} onPress={handleRenameSubmit}>Guardar</Button>
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