import { useIsLoggedIn, useLogIn } from "~/components/auth/Authn";
import { useState } from "react";
import { service } from "~/service/service";
import styles from "./userInfoPage.module.css";
import { useTranslation } from "react-i18next";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";

function useUserInfoPage() {
    const logIn = useLogIn();

    const setError = useSetGlobalError();

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    async function createUser(username: string, password: string) {
        await service.createUser(username, password)
            .then(() => {
                login(username, password);
            })
            .catch((error) => setError(error));
    }

    async function login(username: string, password: string) {
        await service.login(username, password)
            .then(() => {
                logIn();
            })
            .catch((error) => setError(error));
    }

    return { createUser, login };
}

export enum AuthAction {
    CREATE_USER,
    LOGIN
}

function Authenticate({ onActionClicked }: { onActionClicked: (action: AuthAction) => void }) {
    const { t } = useTranslation(["login"]);

    const { createUser } = useUserInfoPage();
    const { login } = useUserInfoPage();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const authenticateButtonDisabled = username.length <= 0 || password.length <= 0;

    function onCreateUserClick() {
        if (authenticateButtonDisabled) {
            return;
        }
        createUser(username, password);
        onActionClicked(AuthAction.CREATE_USER);
    }

    function onLoginCreate() {
        if (authenticateButtonDisabled) {
            return;
        }
        login(username, password);
        onActionClicked(AuthAction.LOGIN);
    }

    return (
        <>
            <h1 className={styles.titleText}>
                {t("login:authenticate_title")}
            </h1>

            <TextField autoFocus>
                <Label className={styles.usernameLabel}>
                    {t("login:username_field_name")}
                </Label>
                <Input className={styles.username} value={username} required
                       onChange={(e) => setUsername(e.target.value)} />
            </TextField>

            <br /><br />

            <TextField autoFocus>
                <Label className={styles.passwordLabel}>
                    {t("login:password_field_name")}
                </Label>
                <Input type={"password"} className={styles.password} value={password} required
                       onChange={(e) => setPassword(e.target.value)} />
            </TextField>

            <br /><br />

            <Button className={styles.roundButton}
                    isDisabled={authenticateButtonDisabled}
                    onPress={onCreateUserClick}>
                {t("login:register_button_title")}
            </Button>

            <br />

            <Button className={styles.roundButton}
                    isDisabled={authenticateButtonDisabled}
                    onPress={onLoginCreate}>
                {t("login:login_button_title")}
            </Button>
        </>
    );
}

export default function UserInfoPage(
    {
        onAuthDone
    }: {
        onAuthDone: (action: AuthAction) => void;
    }) {
    const { t } = useTranslation(["login"]);

    const isLoggedIn = useIsLoggedIn();

    const [actionPerformed, setActionPerformed] = useState<AuthAction | undefined>(undefined);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                {isLoggedIn ? (
                    <>
                        <h1 className={styles.titleText}>
                            {t("login:authenticated_message")}
                        </h1>
                        <button className={styles.roundButton} onClick={() => onAuthDone(actionPerformed!)}>
                            {t("login:authenticated_message")}
                        </button>
                    </>
                ) : (
                    <Authenticate onActionClicked={setActionPerformed} />
                )}
            </div>
        </div>
    );
}
