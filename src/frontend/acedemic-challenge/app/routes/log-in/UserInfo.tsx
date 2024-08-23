import { useSetIsLoggedIn } from "~/components/auth/Authn";
import { useSetError } from "~/components/error/ErrorContainer";
import React, { useState } from "react";
import { service } from "~/service/service";

const MAX_USER_ID = 9999;

export default function UserInfo({
    onAuthDone,
}: {
    onAuthDone: (userId: number) => void;
}) {
    const { userId, createUser } = useUserInfo();

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                {userId != undefined ? (
                    <>
                        <h1 className="text-4xl font-bold text-secondary">
                            User created!
                        </h1>
                        <button
                            className="rnd-button"
                            onClick={() => onAuthDone(userId)}
                        >
                            Click here to advance
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-bold text-secondary">
                            Create New User
                        </h1>
                        <button
                            className="rnd-button"
                            onClick={() => createUser()}
                        >
                            Click To Create user
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function useUserInfo() {
    const setIsLoggedIn = useSetIsLoggedIn();
    const setError = useSetError();

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    const [userId, setUserId] = useState<number | undefined>(undefined);

    async function createUser() {
        const userId = Math.floor(Math.random() * MAX_USER_ID);
        await service
            .createUserOrLogin(userId)
            .then(() => {
                // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
                localStorage["userId"] = userId.toString();
                /*setIsLoggedIn(true);*/ // Sets - user logged in - in auth container
                setUserId(userId);
            })
            .catch((error) => setError(error));
    }

    return { userId, createUser };
}
