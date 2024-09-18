import { useLogIn } from "~/components/auth/Authn";
import { useSetError } from "~/components/error/ErrorContainer";
import React, { useState } from "react";
import { service } from "~/service/service";
import styles from "./userInfoPage.module.css";
import { Button } from "~/components/Button/Button";

const MAX_USER_ID = 9999;

export default function UserInfoPage(
    {
        onAuthDone
    }: {
        onAuthDone: (userId: number) => void;
    }) {
    const { userId, createUser } = useUserInfoPage();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                {userId != undefined ? (
                    <>
                        <h1 className={styles.titleText}>
                            User created!
                        </h1>
                        <Button variant={"round"} onClick={() => onAuthDone(userId)
                        }>
                            Click here to advance
                        </Button>
                    </>
                ) : (
                    <>
                        <h1 className={styles.titleText}>
                            Create New User
                        </h1>
                        <Button variant={"round"} onClick={() => createUser()}>
                            Click To Create user
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function useUserInfoPage() {
    const logIn = useLogIn();
    const setError = useSetError();

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    const [userId, setUserId] = useState<number | undefined>(undefined);

    async function createUser() {
        const generatedUserId = Math.floor(Math.random() * MAX_USER_ID);
        await service
            .createUserOrLogin(generatedUserId)
            .then(() => {
                // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
                logIn(generatedUserId);
                setUserId(generatedUserId);
            })
            .catch((error) => setError(error));
    }

    return { userId, createUser };
}
