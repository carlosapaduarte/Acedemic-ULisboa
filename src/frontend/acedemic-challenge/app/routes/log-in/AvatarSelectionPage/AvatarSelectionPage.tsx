import { t } from "i18next";
import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React, { useEffect } from "react";
import styles from "./avatarSelectionPage.module.css";
import { ConfirmButton } from "~/components/Button";

export default function AvatarSelectionPage(
    {
        userId,
        onComplete
    }: {
        userId: number;
        onComplete: () => void;
    }) {
    const { onConfirmClick, selectedAvatar, setSelectedAvatar, avatars } =
        useAvatarSelection({
            userId: userId,
            onComplete: onComplete
        });

    return (
        <div className={styles.avatarSelectionPageContainer}>
            <div className={styles.avatarSelectionPageInnerContainer}>
                <Title />
                <AvatarList
                    selectedAvatar={selectedAvatar}
                    setSelectedAvatar={setSelectedAvatar}
                    avatars={avatars}
                />
                <div className={styles.confirmButtonContainer}>
                    <ConfirmButton onClick={() => {
                        if (selectedAvatar !== null)
                            onConfirmClick(avatars[selectedAvatar]);
                    }}>
                        {t("login:confirm_level")}
                    </ConfirmButton>
                </div>
            </div>
        </div>
    );
}

function useAvatarSelection(
    {
        userId,
        onComplete
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
        avatars
    };
}

function Title() {
    return (
        <div className={styles.titleContainer}>
            <h1 className={styles.titleHeading}>
                {t("login:select_avatar_initial_question")}
            </h1>
        </div>
    );
}

function AvatarList(
    {
        selectedAvatar,
        setSelectedAvatar,
        avatars
    }: {
        selectedAvatar: number;
        setSelectedAvatar: (index: number) => void;
        avatars: string[];
    }) {
    return (
        <div className={styles.avatarListContainer}>
            <div className={styles.avatarGrid}>
                {avatars.map((avatar: string, index: number) => (
                    <div
                        key={index}
                        className={`${styles.avatarContainer} ${selectedAvatar === index ? styles.selected : ""}`}
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
