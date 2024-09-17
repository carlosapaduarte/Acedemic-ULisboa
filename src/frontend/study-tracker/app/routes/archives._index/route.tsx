import { useEffect, useState } from "react"
import { Archive, File, service } from "~/service/service"
import { utils } from "~/utils"
import { useNavigate } from "@remix-run/react"

function useCreateArchiveView(onArchiveCreated: () => void) {
    const [name, setName] = useState("")
    
    function createArchive() {
        const userId = utils.getUserId()
        service.createArchive(userId, name)
            .then(onArchiveCreated)
    }

    return {setName, createArchive}
}

function CreateArchiveView({onArchiveCreated} : {onArchiveCreated: () => void}) {
    const {setName, createArchive} = useCreateArchiveView(onArchiveCreated)

    return (
        <div>
            <label>New Archive Name</label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createArchive}>
                Create Archive
            </button>
        </div>
    )
}

function useCreateFileView(archiveName: string, onFileCreated: () => void) {
    const [name, setName] = useState("")
    
    function createFile() {
        const userId = utils.getUserId()
        service.createFile(userId, archiveName, name)
            .then(onFileCreated)
    }

    return {name, setName, createFile}
}

function CreateFileView({archiveName, onFileCreated} : {archiveName: string, onFileCreated: () => void}) {
    const {name, setName, createFile} = useCreateFileView(archiveName, onFileCreated)

    return (
        <div>
            <label>New File Name</label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createFile}>
                Create File
            </button>
        </div>
    )
}

function useArchiveView(initialArchive: Archive) {
    const [archive, setArchive] = useState(initialArchive)
    
    function refreshArchive() {
        const userId = utils.getUserId()
        service.getArchive(userId, archive.name)
            .then((archive: Archive) => setArchive(archive))
    }

    return {archive, refreshArchive}
}

function ArchiveView({initialArchive}: {initialArchive: Archive}) {
    const navigate = useNavigate();
    const {archive, refreshArchive} = useArchiveView(initialArchive)

    return (
        <div>
            <h1>Archive:</h1>
            <span>Name: {archive.name}</span>
            <br/>
            <CreateFileView archiveName={archive.name} onFileCreated={refreshArchive} />
            {archive.files.map((file: File, index: number) => 
                <div key={index}>
                    <h1>File: {file.name}</h1>
                    <button onClick={() => navigate(`/archives/${archive.name}/files/${file.name}`)}>Open File</button>
                </div>
            )}
        </div>
    )
}

function useArchiveListView() {
    const [archives, setArchives] = useState<Archive[]>([])    

    function refreshArchives() {
        const userId = utils.getUserId()
        service.getArchives(userId)
            .then((value: Archive[]) => setArchives(value))
    }

    useEffect(() => {
        refreshArchives()
    }, [])
    
    return {archives, refreshArchives}
}

export default function ArchiveListView() {
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