import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { FileItem, service } from "~/service/service";
import { Editor } from "./editor";
import { RequireAuthn } from "~/components/auth/RequireAuthn";
import { useTranslation } from "react-i18next";

function FileView() {
    const { t } = useTranslation(["notes"]);

    const setGlobalError = useSetGlobalError();

    const params = useParams();
    const archiveName = params.archiveName;
    const filename = params.filename;

    const [file, setFile] = useState<FileItem | undefined>(undefined);

    useEffect(() => {
        if (archiveName == undefined || filename == undefined)
            setGlobalError(new Error("Archive name and filename should not be null!"));
        else {
            service.getArchives()
                .then((archives) => {
                    const findFile = (items: typeof archives): FileItem | undefined => {
                        for (const archive of items) {
                            if (archive.name === archiveName) {
                                const match = archive.files.find((item) => item.name === filename);
                                if (match) return match;
                            }
                            const nested = findFile(archive.sub_archives);
                            if (nested) return nested;
                        }
                        return undefined;
                    };
                    const found = findFile(archives);
                    if (!found) throw new Error("Note not found");
                    setFile(found);
                })
                .catch((e: Error) => setGlobalError(e));
        }
    }, [archiveName, filename, setGlobalError]);

    return file && archiveName ?
        <div>
            <span>{t("notes:file_name")} {file.name}</span>
            <br />
            <Editor file={file} />
        </div>
        :
        <></>;
}

export default function FileViewAuthControlled() {
    return (
        <RequireAuthn>
            <FileView />
        </RequireAuthn>
    );
}
