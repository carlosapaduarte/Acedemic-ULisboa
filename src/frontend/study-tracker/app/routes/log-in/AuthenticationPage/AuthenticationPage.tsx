import { useIsLoggedIn, useLogIn } from "~/components/auth/Authn";
import { useState } from "react";
import { service } from "~/service/service";
import styles from "./authenticationPage.module.css";
import { useTranslation } from "react-i18next";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";

function useUserInfoPage() {
    const logIn = useLogIn();

    const setGlobalError = useSetGlobalError();

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    async function createUser(username: string, password: string) {
        await service.createUser(username, password)
            .then(() => {
                login(username, password);
            })
            .catch((error) => setGlobalError(error));
    }

    async function login(username: string, password: string) {
        await service.login(username, password)
            .then(() => {
                logIn();
            })
            .catch((error) => setGlobalError(error));
    }

    return { createUser, login };
}

export enum AuthAction {
    CREATE_USER,
    LOGIN
}

function Authenticate({ onActionClicked }: { onActionClicked: (action: AuthAction) => void }) {
    const { t } = useTranslation(["login"]);

    const { createUser, login } = useUserInfoPage();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const authenticateButtonDisabled = username.length <= 0 || password.length <= 0 || loginLoading;

    function onCreateUserClick() {
        if (authenticateButtonDisabled) {
            return;
        }

        setLoginLoading(true);
        createUser(username, password).then(() => {
            onActionClicked(AuthAction.CREATE_USER);
            setLoginLoading(false);
        });
    }

    function onLoginCreate() {
        if (authenticateButtonDisabled) {
            return;
        }

        setLoginLoading(true);
        login(username, password).then(() => {
            onActionClicked(AuthAction.LOGIN);
            setLoginLoading(false);
        });
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

            <h2>
                {loginLoading ? "Logging in..." : ""}
            </h2>
        </>
    );
}

export default function AuthenticationPage(
    {
        onAuthDone
    }: {
        onAuthDone: (action: AuthAction) => void;
    }) {
    const isLoggedIn = useIsLoggedIn();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                {isLoggedIn ? null : (
                    <Authenticate onActionClicked={(action) => onAuthDone(action)} />
                )}
            </div>
        </div>
    );
}
