import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./richTextEditor.module.css";
import { useTranslation } from "react-i18next";
import { FaBold, FaItalic, FaStrikethrough, FaListUl, FaListOl } from "react-icons/fa6";

const MenuBar = ({ editor }: { editor: any }) => {
  const { t } = useTranslation(["task", "notes"]);
  if (!editor) return null;

  return (
    <div className={styles.menuBar}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.isActive : ""}
        aria-label={t("notes:bold", "Bold")}
        title={t("notes:bold", "Bold")}
      >
        <FaBold aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.isActive : ""}
        aria-label={t("notes:italic", "Italic")}
        title={t("notes:italic", "Italic")}
      >
        <FaItalic aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? styles.isActive : ""}
        aria-label={t("notes:strike", "Strikethrough")}
        title={t("notes:strike", "Strikethrough")}
      >
        <FaStrikethrough aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? styles.isActive : ""}
        aria-label={t("notes:heading_1", "Heading 1")}
        title={t("notes:heading_1", "Heading 1")}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? styles.isActive : ""}
        aria-label={t("notes:heading_2", "Heading 2")}
        title={t("notes:heading_2", "Heading 2")}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? styles.isActive : ""}
        aria-label={t("notes:bullets", "Bulleted list")}
        title={t("notes:bullets", "Bulleted list")}
      >
        <FaListUl aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? styles.isActive : ""}
        aria-label={t("notes:numbered", "Numbered list")}
        title={t("notes:numbered", "Numbered list")}
      >
        <FaListOl aria-hidden="true" />
      </button>
    </div>
  );
};

export const RichTextEditor = ({ content, onUpdate }: { content: string, onUpdate: (c: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
      onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  return (
    <div className={styles.editorContainer}>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className={styles.editorContent}
        onMouseDown={(event) => {
          const target = event.target as HTMLElement;
          if (!target.closest(".ProseMirror")) editor?.commands.focus("end");
        }}
      />
    </div>
  );
};
