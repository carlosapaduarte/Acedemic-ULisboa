import { service } from "~/service/service";
import { useTranslation } from "react-i18next";
import { useSetError } from "../error/ErrorContainer";

export function Avatar({
    userId,
    onComplete,
}: {
    userId: number;
    onComplete: () => void;
}) {
    const setError = useSetError();

    async function onAvatarClickHandler(avatarFilename: string) {
        await service
            .selectAvatar(userId, avatarFilename)
            .then(() => onComplete())
            .catch((error) => setError(error));
    }

    return <AvatarSelection onAvatarClick={onAvatarClickHandler} />;
}

function AvatarSelection({
    onAvatarClick,
}: {
    onAvatarClick: (avatarFilename: string) => void;
}) {
    return (
        <div className="h-full flex-col">
            <Title />
            <AvatarList onAvatarClick={onAvatarClick} />
        </div>
    );
}

function Title() {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center py-[1%]">
            <h5 className="text-3xl font-medium text-secondary">
                {t("login:select_avatar_initial_question")}
            </h5>
        </div>
    );
}

function AvatarsInRow({
    avatars,
    onAvatarClick,
}: {
    avatars: string[];
    onAvatarClick: (avatarFilename: string) => void;
}) {
    // TODO: later, use array string

    return (
        <div className={"flex flex-row justify-center"}>
            {avatars.map((avatar: string, index: number) => (
                <div key={index} className="p-[0.5%]" onClick={() => onAvatarClick(avatar)}>
                    <img
                        src={avatar}
                        width="100px"
                        loading="lazy"
                        alt={`Avatar ${index}`}
                    />
                </div>
            ))}
        </div>
    );
}

function AvatarList({
    onAvatarClick,
}: {
    onAvatarClick: (avatarFilename: string) => void;
}) {
    // TODO: just for testing...
    function createAvatars(): string[] {
        const avatars: string[] = [];
        for (let u = 0; u < 30; u++) {
            avatars.push("./test.webp"); // filename
        }
        return avatars;
    }

    const avatars: string[] = createAvatars();

    // TODO: this function is very similar to NewCalendar.tsx: parsePerWeek()
    function separatePerRow(avatars: string[]): string[][] {
        const avatarsPerRow: string[][] = [];

        const chunkSize = 12; // from David's Avatar page design
        while (avatars.length > 0) {
            avatarsPerRow.push(avatars.splice(0, chunkSize));
        }

        return avatarsPerRow;
    }

    return (
        <div className="flex flex-col">
            {separatePerRow(avatars).map((avatarsInRow: string[], index: number) => (
                <AvatarsInRow
                    key={index}
                    avatars={avatarsInRow}
                    onAvatarClick={onAvatarClick}
                />
            ))}
        </div>
    );
}

