import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { ArchiveItem, FileItem, service } from "~/service/service";
import styles from "./notesPage.module.css";
import { useTranslation } from "react-i18next";
import {
  FaFolder,
  FaFilePdf,
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

import "react-quill/dist/quill.snow.css";
const ReactQuill = lazy(() => import("react-quill"));

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["image", "link"],
    ["clean"],
  ],
};

function NotesPage() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  const [rootArchives, setRootArchives] = useState<ArchiveItem[]>([]);
  const [folderPath, setFolderPath] = useState<ArchiveItem[]>([]);
  const currentFolder =
    folderPath.length > 0 ? folderPath[folderPath.length - 1] : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [newTextFileName, setNewTextFileName] = useState("");

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de abertura de ficheiro e carregamento
  const loadData = () => {
    service
      .getArchives()
      .then((data) => {
        setRootArchives(data);

        // Sincroniza pasta atual se estivermos navegando
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

        // LER URL PARA ABRIR AUTOMATICAMENTE (Vindo da Home)
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

  // AUTO-SAVE
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
    setEditingFile(file);
    setTextContent(file.text || "");
    setSaveStatus("Guardado");

    try {
      const recent = JSON.parse(localStorage.getItem("recent_notes") || "[]");
      const updated = recent.filter((n: any) => n.id !== file.id);

      const folderName = currentFolder ? currentFolder.name : "Geral";

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
    if (!newFolderName.trim()) return;
    try {
      await service.createArchive(newFolderName, currentFolder?.id || null);
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      loadData();
    } catch (e: any) {
      setFolderError(e.message);
    }
  };

  const handleCreateFile = async () => {
    if (!currentFolder || !newTextFileName.trim()) return;
    try {
      await service.createFile(currentFolder.id, newTextFileName, "note", "");
      setNewTextFileName("");
      setIsCreateFileOpen(false);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === "folder")
        await service.renameArchive(renameTarget.id, renameValue);
      else await service.renameFile(renameTarget.id, renameValue);
      setRenameTarget(null);
      loadData();
    } catch (e) {
      alert("Erro ao renomear");
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (confirm("Apagar ficheiro?")) {
      await service.deleteFile(id);
      loadData();
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (confirm("Apagar pasta e conteúdo?")) {
      await service.deleteArchive(id);
      loadData();
    }
  };

  // PESQUISA
  const isSearching = searchQuery.trim().length > 0;
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
    : [];

  if (editingFile) {
    return (
      <div className={styles.pageContainer} style={{ background: "white" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "15px",
            borderBottom: "1px solid #eee",
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
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FaArrowLeft /> Voltar
            </button>
            <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
              {editingFile.name}
            </h1>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#888" }}>
            {saveStatus}
          </span>
        </header>
        <div style={{ flex: 1, marginTop: "20px" }}>
          {isClient && (
            <Suspense fallback={<div>Carregando...</div>}>
              <ReactQuill
                theme="snow"
                value={textContent}
                onChange={setTextContent}
                modules={quillModules}
                style={{ height: "70vh" }}
              />
            </Suspense>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>
          {t("notes:repository_title", "Repositório Académico")}
        </h1>
        <p className={styles.subTitle}>
          {folderPath.length === 0
            ? "Visão Geral"
            : folderPath.map((f) => f.name).join(" / ")}
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
          <Button
            className={styles.secondaryButton}
            onPress={() => setIsCreateFolderOpen(true)}
          >
            <FaFolderPlus /> Pasta
          </Button>
          {currentFolder && (
            <Button
              className={styles.primaryButton}
              onPress={() => setIsCreateFileOpen(true)}
            >
              <FaFileCirclePlus /> Nota
            </Button>
          )}
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.gridContainer}>
          {archivesToShow
            .filter((a) =>
              a.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((archive) => (
              <div
                key={archive.id}
                className={styles.folderCard}
                onClick={() => setFolderPath([...folderPath, archive])}
              >
                <div
                  style={{ alignSelf: "flex-end", display: "flex", gap: "8px" }}
                >
                  <FaPen
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTarget({
                        id: archive.id,
                        type: "folder",
                        currentName: archive.name,
                      });
                      setRenameValue(archive.name);
                    }}
                  />
                  <FaXmark
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
            .filter((f) =>
              f.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((file) => (
              <div
                key={file.id}
                className={styles.fileRow}
                onClick={() => openTextEditor(file)}
              >
                <FaNoteSticky
                  color="#FFCA28"
                  size={20}
                  style={{ marginRight: "10px" }}
                />
                <span style={{ flex: 1 }}>{file.name}</span>
                <MenuTrigger>
                  <Button className={styles.iconButton}>
                    <FaEllipsisVertical />
                  </Button>
                  <Popover className={styles.popoverMenu}>
                    <Menu
                      onAction={(key) => {
                        if (key === "rename") {
                          setRenameTarget({
                            id: file.id,
                            type: "file",
                            currentName: file.name,
                          });
                          setRenameValue(file.name);
                        }
                        if (key === "delete") handleDeleteFile(file.id);
                      }}
                    >
                      <MenuItem id="rename" className={styles.actionMenuItem}>
                        <FaPen /> Renomear
                      </MenuItem>
                      <MenuItem
                        id="delete"
                        className={`${styles.actionMenuItem} ${styles.dangerItem}`}
                      >
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
      <Modal
        isOpen={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        className={styles.modalOverlay}
      >
        <Dialog className={styles.modalContent}>
          <h2>Nova Pasta</h2>
          <input
            className={styles.searchInput}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "100%",
              margin: "10px 0",
            }}
          />
          {folderError && <p style={{ color: "red" }}>{folderError}</p>}
          <Button className={styles.primaryButton} onPress={handleCreateFolder}>
            Criar
          </Button>
        </Dialog>
      </Modal>

      {/* MODAL CRIAR NOTA */}
      <Modal
        isOpen={isCreateFileOpen}
        onOpenChange={setIsCreateFileOpen}
        className={styles.modalOverlay}
      >
        <Dialog className={styles.modalContent}>
          <h2>Nova Nota</h2>
          <input
            className={styles.searchInput}
            value={newTextFileName}
            onChange={(e) => setNewTextFileName(e.target.value)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "100%",
              margin: "10px 0",
            }}
          />
          <Button className={styles.primaryButton} onPress={handleCreateFile}>
            Criar
          </Button>
        </Dialog>
      </Modal>

      {/* MODAL RENOMEAR */}
      <Modal
        isOpen={!!renameTarget}
        onOpenChange={() => setRenameTarget(null)}
        className={styles.modalOverlay}
      >
        <Dialog className={styles.modalContent}>
          <h2>Renomear</h2>
          <input
            className={styles.searchInput}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "100%",
              margin: "10px 0",
            }}
          />
          <Button className={styles.primaryButton} onPress={handleRenameSubmit}>
            Guardar
          </Button>
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
