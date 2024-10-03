import { useEffect, useState } from "react"
import { Archive, File, service } from "~/service/service"
import { utils } from "~/utils"
import { useNavigate } from "@remix-run/react"
import { RequireAuthn } from "~/components/auth/RequireAuthn"
import { useTranslation } from "react-i18next"

function useCreateArchiveView(onArchiveCreated: () => void) {
    const [name, setName] = useState("")
    
    function createArchive() {
        service.createArchive(name)
            .then(onArchiveCreated)
    }

    return {setName, createArchive}
}

function CreateArchiveView({onArchiveCreated} : {onArchiveCreated: () => void}) {
    const { t } = useTranslation(["notes"]);
    
    const {setName, createArchive} = useCreateArchiveView(onArchiveCreated)

    return (
        <div>
            <label>
                {t("notes:new_archive_name")}
            </label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createArchive}>
                {t("notes:create_archive")}
            </button>
        </div>
    )
}

function useCreateFileView(archiveName: string, onFileCreated: () => void) {
    const [name, setName] = useState("")
    
    function createFile() {
        service.createFile(archiveName, name)
            .then(onFileCreated)
    }

    return {name, setName, createFile}
}

function CreateFileView({archiveName, onFileCreated} : {archiveName: string, onFileCreated: () => void}) {
    const { t } = useTranslation(["notes"]);

    const {name, setName, createFile} = useCreateFileView(archiveName, onFileCreated)

    return (
        <div>
            <label>
                {t("notes:filename")}
            </label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createFile}>
                {t("notes:create_file_confirmation")}
            </button>
        </div>
    )
}

function useArchiveView(initialArchive: Archive) {
    const [archive, setArchive] = useState(initialArchive)
    
    function refreshArchive() {
        service.getArchive(archive.name)
            .then((archive: Archive) => setArchive(archive))
    }

    return {archive, refreshArchive}
}

function ArchiveView({initialArchive}: {initialArchive: Archive}) {
    const { t } = useTranslation(["notes"]);

    const navigate = useNavigate();
    const {archive, refreshArchive} = useArchiveView(initialArchive)

    return (
        <div>
            <h1>
                {t("notes:archive_list")}
            </h1>
            <span>
                {t("notes:archive_name")} {archive.name}
            </span>
            <br/>
            <CreateFileView archiveName={archive.name} onFileCreated={refreshArchive} />
            {archive.files.map((file: File, index: number) => 
                <div key={index}>
                    <h1>{t("notes:file_name")} {file.name}</h1>
                    <button onClick={() => navigate(`/archives/${archive.name}/files/${file.name}`)}>
                        {t("notes:open_file")}
                    </button>
                </div>
            )}
        </div>
    )
}

function useArchiveListView() {
    const [archives, setArchives] = useState<Archive[]>([])    

    function refreshArchives() {
        service.getArchives()
            .then((value: Archive[]) => setArchives(value))
    }

    useEffect(() => {
        refreshArchives()
    }, [])
    
    return {archives, refreshArchives}
}

function ArchiveListView() {
    const {archives, refreshArchives} = useArchiveListView()

    return (
        <div>
            <CreateArchiveView onArchiveCreated={refreshArchives} />
            {archives.map((archive: Archive, index: number) => 
                <div key={index}>
                    <ArchiveView initialArchive={archive} />
                    <br/>
                </div>
            )}
        </div>
    )
}

export default function ArchiveListViewAuthControlled() {
    return (
        <RequireAuthn>
            <ArchiveListView/>
        </RequireAuthn>
    )
}