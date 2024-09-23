import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { File, service } from "~/service/service";
import { utils } from "~/utils";
import { Editor } from "./editor";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

function FileView() {
    const setError = useSetGlobalError();

    const params = useParams();
    const archiveName = params.archiveName;
    const filename = params.filename;

    const [file, setFile] = useState<File | undefined>(undefined);

    useEffect(() => {
        if (archiveName == undefined || filename == undefined)
            setError(new Error("Archive name and filename should not be null!"));
        else {
            const userId = utils.getUserId();
            service.getFile(userId, archiveName, filename)
                .then((file: File) => setFile(file))
                .catch((e: Error) => setError(e));
        }
    }, []);

    return file && archiveName ?
        <div>
            <span>Name: {file.name}</span>
            <br />
            <Editor archiveName={archiveName} file={file} />
        </div>
        :
        <></>;
}

export default function FileViewAuthControlled() {
    return (
        <RequireAuthn>
            <FileView/>
        </RequireAuthn>
    )
}