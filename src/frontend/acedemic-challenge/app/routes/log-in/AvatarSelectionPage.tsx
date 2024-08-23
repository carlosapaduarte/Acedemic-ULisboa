import { t } from "i18next";
import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React, { useEffect } from "react";

export default function AvatarSelectionPage({
    userId,
    onComplete,
}: {
    userId: number;
    onComplete: () => void;
}) {
    const { onConfirmClick, selectedAvatar, setSelectedAvatar, avatars } =
        useAvatarSelection({
            userId: userId,
            onComplete: onComplete,
        });

    return (
        <div className="flex h-full w-full flex-row items-center justify-center">
            <div className="flex h-full w-full flex-col items-center">
                <Title />
                <AvatarList
                    selectedAvatar={selectedAvatar}
                    setSelectedAvatar={setSelectedAvatar}
                    avatars={avatars}
                />
                <div className="flex w-full flex-grow items-center justify-center">
                    <button
                        className="cut-button h-16 w-64 bg-yellow text-2xl" /*hover:bg-yellow/85*/
                        onClick={() => {
                            if (selectedAvatar !== null)
                                onConfirmClick(avatars[selectedAvatar]);
                        }}
                    >
                        {t("login:confirm_level")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function useAvatarSelection({
    userId,
    onComplete,
}: {
    userId: number;
    onComplete: () => void;
}) {
    const setError = useSetError();
    const [selectedAvatar, setSelectedAvatar] = React.useState<number>(-1);
    const [avatars, setAvatars] = React.useState<string[]>([]);

    async function onConfirmClickHandler(avatarFilename: string) {
        await service
            .selectAvatar(userId, avatarFilename)
            .then(() => onComplete())
            .catch((error) => setError(error));
    }

    useEffect(() => {
        setAvatars(createAvatars());
    }, []);

    return {
        onConfirmClick: onConfirmClickHandler,
        selectedAvatar,
        setSelectedAvatar,
        avatars,
    };
}

function Title() {
    return (
        <div className="my-8 flex justify-center">
            <h5 className="text-3xl font-medium text-secondary">
                {t("login:select_avatar_initial_question")}
            </h5>
        </div>
    );
}

function AvatarList({
    selectedAvatar,
    setSelectedAvatar,
    avatars,
}: {
    selectedAvatar: number;
    setSelectedAvatar: (index: number) => void;
    avatars: string[];
}) {
    return (
        <div className="h-2/5 overflow-auto">
            <div className="avatar-grid gap-2">
                {avatars.map((avatar: string, index: number) => (
                    <div
                        className={`min-h-8 min-w-8 ${selectedAvatar === index ? "border-4 border-yellow" : ""}`} /*max-h-24 max-w-24*/
                        onClick={() => setSelectedAvatar(index)}
                    >
                        <img
                            src={avatar}
                            loading="lazy"
                            alt={`Avatar ${index}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function createAvatars(): string[] {
    const avatars: string[] = [];
    for (let u = 0; u < 30; u++) {
        avatars.push("./test.webp"); // filename
    }
    return avatars;
}
