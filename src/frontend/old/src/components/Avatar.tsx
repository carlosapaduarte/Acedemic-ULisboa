import {Box, Typography} from "@mui/material"
import {t} from "i18next"

function Title() {
    return (
        <Box display="flex" justifyContent="center" marginBottom="5%" marginTop="3%">
            <Typography variant="h5">
                {t("login:select_avatar_initial_question")}
            </Typography>
        </Box>
    )
}

function AvatarsInRow({avatars, onAvatarClick}: {
    avatars: string[],
    onAvatarClick: (avatarFilename: string) => void
}) {

    // TODO: later, use array string

    return (
        <Box display="flex" flexDirection="row" justifyContent="center">
            {avatars.map((avatar: string, index: number) =>
                <Box key={index} padding="0.5%" onClick={() => onAvatarClick(avatar)}>
                    <img
                        src={avatar}
                        height="100px"
                        loading="lazy"
                    />
                </Box>
            )}
        </Box>
    )
}

function AvatarList({onAvatarClick}: { onAvatarClick: (avatarFilename: string) => void }) {

    // TODO: just for testing...
    function createAvatars(): string[] {
        const avatars: string[] = []
        for (let u = 0; u < 30; u++) {
            avatars.push("./test.webp") // filename
        }
        return avatars
    }

    const avatars: string[] = createAvatars()

    // TODO: this function is very similar to NewCalendar.tsx: parsePerWeek()
    function separatePerRow(avatars: string[]): string[][] {
        const avatarsPerRow: string[][] = []

        const chunkSize = 12 // from David's Avatar page design
        while (avatars.length > 0) {
            avatarsPerRow.push(avatars.splice(0, chunkSize))
        }

        return avatarsPerRow
    }

    return (
        <Box>
            {separatePerRow(avatars).map((avatarsInRow: string[], index: number) =>
                <AvatarsInRow key={index} avatars={avatarsInRow} onAvatarClick={onAvatarClick}/>
            )}
        </Box>
    )
}


export default function AvatarSelection({onAvatarClick}: { onAvatarClick: (avatarFilename: string) => void }) {
    return (
        <Box sx={{class: "flex-col"}}>
            <Title/>
            <AvatarList onAvatarClick={onAvatarClick}/>
        </Box>
    )
}