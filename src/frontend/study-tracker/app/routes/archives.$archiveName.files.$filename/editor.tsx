import { useEditor } from "@tiptap/react";
import { useState } from "react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Link, RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap";
import { ActionIcon, MantineProvider } from "@mantine/core";
import { FileItem, service } from "~/service/service";
import { useTranslation } from "react-i18next";
import { FaFloppyDisk } from "react-icons/fa6";

import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";


function Save({ onSaveClick }: { onSaveClick: () => Promise<void> }) {
    const { editor } = useRichTextEditorContext();
    const { t } = useTranslation(["notes"]);
    return (
        <RichTextEditor.Control
            onClick={() => { void onSaveClick(); }}
            aria-label={t("notes:save", "Save note")}
            title={t("notes:save", "Save note")}
        >
            <ActionIcon size="1rem"><FaFloppyDisk aria-hidden="true" /></ActionIcon>
        </RichTextEditor.Control>
    );
}

export function Editor({ file }: { file: FileItem }) {
    const { t } = useTranslation(["notes"]);
    const [saveStatus, setSaveStatus] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link,
            Superscript,
            SubScript,
            Highlight,
            TextAlign.configure({ types: ["heading", "paragraph"] })
        ],
        content: file.text
    });

    async function onSaveClickHandler() {
        const html = editor?.getHTML();
        if (html === undefined) return;
        setSaveStatus(t("notes:saving", "Saving…"));
        try {
            await service.updateFileText(file.id, html);
            setSaveStatus(t("notes:saved", "Saved"));
        } catch (error) {
            setSaveStatus(t("notes:save_error", "Could not save"));
            console.error("Failed to save note content", error);
        }
    }

    return (
        <MantineProvider>
            <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar sticky stickyOffset={0}>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                        <RichTextEditor.Subscript />
                        <RichTextEditor.Superscript />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                        <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Undo />
                        <RichTextEditor.Redo />
                    </RichTextEditor.ControlsGroup>

                    <Save onSaveClick={onSaveClickHandler} />
                </RichTextEditor.Toolbar>

                <span role="status">{saveStatus}</span>

                <RichTextEditor.Content />
            </RichTextEditor>
        </MantineProvider>
    );
}
