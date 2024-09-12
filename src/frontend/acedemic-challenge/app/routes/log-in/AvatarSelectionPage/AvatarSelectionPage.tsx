import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";
import React, { useEffect } from "react";
import styles from "./avatarSelectionPage.module.css";
import { useTranslation } from "react-i18next";
import { CutButton } from "~/components/Button/Button";

function createAvatars(): string[] {
    const avatars: string[] = [];
    for (let u = 0; u < 30; u++) {
        avatars.push("./test.webp"); // filename
    }
    return avatars;
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
    const { t } = useTranslation(["login"]);

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
                            alt={`Avatar ${index}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

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
    const { t } = useTranslation(["login"]);

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
                    <CutButton className={styles.confirmAvatarButton} onClick={() => {
                        if (selectedAvatar !== null)
                            onConfirmClick(avatars[selectedAvatar]);
                    }}>
                        {t("login:confirm_level")}
                    </CutButton>
                </div>
            </div>
        </div>
    );
}