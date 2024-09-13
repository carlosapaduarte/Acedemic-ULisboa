import { useEffect, useState } from "react"
import { Archive, File, service } from "~/service/service"
import { utils } from "~/utils"
import { Editor } from "../archives.$archiveName.files.$filename/editor"
import { useNavigate } from "@remix-run/react"

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
            <label>New Archive Name</label>
            <input onChange={(e) => setName(e.target.value)} />
            <br/>
            <button onClick={createArchive}>
                Create Archive
            </button>
        </div>
    )
}

function useCreateFileView(archiveName: string) {
    const [name, setName] = useState("")
    
    function createFile() {
        const userId = utils.getUserId()
        service.createFile(userId, archiveName, name)
    }

    return {name, setName, createFile}
}

function CreateFileView({archiveName} : {archiveName: string}) {
    const {name, setName, createFile} = useCreateFileView(archiveName)

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

function ArchiveView({archive}: {archive: Archive}) {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Archive:</h1>
            <span>Name: {archive.name}</span>
            <br/>
            <CreateFileView archiveName={archive.name}/>
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
            {archives.map((archive: Archive, index: number) => 
                <div key={index}>
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