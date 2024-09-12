import { useEffect, useState } from "react"
import { Archive, File, service } from "~/service/service"
import { utils } from "~/utils"

function useCreateArchiveView() {
    const [name, setName] = useState("")
    
    function createArchive() {
        const userId = utils.getUserId()
        service.createArchive(userId, name)
    }

    return {name, setName, createArchive}
}

function CreateArchiveView() {
    const {name, setName, createArchive} = useCreateArchiveView()

    return (
        <div>
            <label>Archive Name</label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createArchive}>
                Create Archive
            </button>
        </div>
    )
}

function FileView({file}: {file: File}) {
    return (
        <div>
            <h1>File:</h1>
            <span>Name: {file.name}</span>
            <span>Text: {file.text}</span>
        </div>
    )
}

function ArchiveView({archive}: {archive: Archive}) {
    return (
        <div>
            <h1>Archive:</h1>
            <span>Name: {archive.name}</span>
            {archive.files.map((file: File) => 
                <FileView file={file} />
            )}
        </div>
    )
}

function useArchiveListView() {
    const [archives, setArchives] = useState<Archive[]>([])    

    useEffect(() => {
        const userId = utils.getUserId()
        service.getArchives(userId)
            .then((value: Archive[]) => setArchives(value))
    }, [])
    
    return {archives}
}

function ArchiveListView() {
    const {archives} = useArchiveListView()

    return (
        <div>
            {archives.map((archive: Archive) => 
                <div>
                    <ArchiveView archive={archive} />
                    <br/>
                </div>
            )}
        </div>
    )
}

export default function Study() {
    return (
        <div>
            <CreateArchiveView />
            <br/>
            <ArchiveListView />
        </div>
    )
}