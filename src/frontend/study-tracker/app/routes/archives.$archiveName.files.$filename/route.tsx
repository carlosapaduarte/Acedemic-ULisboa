import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useSetError } from "~/components/error/ErrorContainer";
import { File, service } from "~/service/service"
import { utils } from "~/utils";

export default function FileView() {
    const setError = useSetError()
    
    const params = useParams();
    const archiveName = params.archiveName
    const filename = params.filename

    const [file, setFile] = useState<File | undefined>(undefined)

    useEffect(() => {
        if (archiveName == undefined || filename == undefined)
            setError(new Error("Archive name and filename should not be null!"))
        else {
            const userId = utils.getUserId()
            service.getFile(userId, archiveName, filename)
                .then((file: File) => setFile(file))
                .catch((e: Error) => setError(e))
        }
    }, [])

    return file ?
        <div>
            <span>Name: {file.name}</span>
            <br/>
            <span>Text: {file.text}</span>
        </div>
        :
        <></>
}