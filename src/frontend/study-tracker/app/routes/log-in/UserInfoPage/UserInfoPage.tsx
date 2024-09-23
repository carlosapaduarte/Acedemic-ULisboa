import { useLogIn } from "~/components/auth/Authn";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import React, { useState } from "react";
import { service } from "~/service/service";
import styles from "./userInfoPage.module.css";

const MAX_USER_ID = 9999;

function useUserInfoPage() {
    const logIn = useLogIn();
    const setError = useSetGlobalError();

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
                        <button className={styles.roundButton} onClick={() => onAuthDone(userId)
                        }>
                            Click here to advance
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className={styles.titleText}>
                            Create New User
                        </h1>
                        <button className={styles.roundButton} onClick={() => createUser()}>
                            Click To Create user
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
