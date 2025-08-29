import { useIsLoggedIn, useLogIn } from "~/components/auth/Authn";
import { useContext, useState } from "react";
import { AuthError, service } from "~/service/service";
import styles from "./authenticationPage.module.css";
import { useTranslation } from "react-i18next";
import {
    Button,
    FieldError,
    Form,
    Input,
    Label,
    TextField,
} from "react-aria-components";
import classNames from "classnames";
import { ChallengesContext } from "~/hooks/useChallenges";

function useAuthenticationPage() {
    const logIn = useLogIn();
    const { showBadgeAnimation } = useContext(ChallengesContext);
    const [authError, setAuthError] = useState<AuthError | null>(null);

    // This function should redirect user to ULisboa authentication page,
    // so he can obtain an access token

    async function createUser(username: string, password: string) {
        await service
            .createUser(username, password)
            .then(() => {
                login(username, password);
            })
            .catch((error: AuthError) => {
                setAuthError(error);
                return Promise.reject(error);
            });
    }

    async function login(username: string, password: string) {
        await service
            .login(username, password)
            .then((loginResponse) => {
                if (
                    loginResponse.newly_awarded_badges &&
                    loginResponse.newly_awarded_badges.length > 0
                ) {
                    showBadgeAnimation(loginResponse.newly_awarded_badges[0]);
                }
                logIn(); // Continua o processo de login normal
            })
            .catch((error: AuthError) => {
                setAuthError(error);
                return Promise.reject(error);
            });
    }

    return { createUser, login, authError, setAuthError };
}

export enum AuthAction {
    CREATE_USER,
    LOGIN,
}

const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 20;

function Authenticate({
    onActionClicked,
}: {
    onActionClicked: (action: AuthAction) => void;
}) {
    const { t } = useTranslation(["login"]);

    const { createUser, login, authError, setAuthError } =
        useAuthenticationPage();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const authenticateButtonDisabled =
        username.length < MIN_USERNAME_LENGTH ||
        username.length > MAX_USERNAME_LENGTH ||
        password.length < MIN_PASSWORD_LENGTH ||
        loginLoading;

    function onCreateUserClick() {
        if (authenticateButtonDisabled) {
            return;
        }

        setLoginLoading(true);
        createUser(username, password)
            .then(() => {
                onActionClicked(AuthAction.CREATE_USER);
            })
            .catch(() => {})
            .finally(() => setLoginLoading(false));
    }

    function onLoginCreate() {
        if (authenticateButtonDisabled) {
            return;
        }

        setLoginLoading(true);
        login(username, password)
            .then(() => {
                onActionClicked(AuthAction.LOGIN);
                setLoginLoading(false);
            })
            .catch(() => {})
            .finally(() => setLoginLoading(false));
    }

    function renderUsernameErrorMessage() {
        if (authError?.type == "USERNAME_ALREADY_EXISTS") {
            return "Username already exists";
        }
    }

    function renderPasswordErrorMessage() {
        if (authError?.type == "INVALID_USERNAME_OR_PASSWORD") {
            return "Invalid username or password";
        }
    }

    return (
        <div className={styles.authenticationContainer}>
            <h1 className={styles.titleText}>
                {t("login:authenticate_title")}
            </h1>

            <Form className={styles.authenticationForm}>
                <div className={styles.authenticationTextFields}>
                    <TextField
                        className={styles.formTextField}
                        autoFocus
                        isRequired
                        minLength={MIN_USERNAME_LENGTH}
                        maxLength={MAX_USERNAME_LENGTH}
                        isInvalid={
                            renderUsernameErrorMessage() != undefined
                                ? true
                                : undefined
                        }
                    >
                        <Label className={styles.formSectionTitle}>
                            {t("login:username_field_name")}
                        </Label>
                        <Input
                            className={styles.formInput}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setAuthError(null);
                            }}
                        />
                        <FieldError className={styles.textFieldError}>
                            {renderUsernameErrorMessage()}
                        </FieldError>
                    </TextField>

                    <TextField
                        className={styles.formTextField}
                        type={"password"}
                        isRequired
                        minLength={MIN_PASSWORD_LENGTH}
                        isInvalid={
                            renderPasswordErrorMessage() != undefined
                                ? true
                                : undefined
                        }
                    >
                        <Label className={styles.formSectionTitle}>
                            {t("login:password_field_name")}
                        </Label>
                        <Input
                            className={styles.formInput}
                            value={password}
                            required
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setAuthError(null);
                            }}
                        />
                        <FieldError className={styles.textFieldError}>
                            {renderPasswordErrorMessage()}
                        </FieldError>
                    </TextField>
                </div>
                <div className={styles.authenticationButtons}>
                    <Button
                        className={classNames(
                            styles.roundButton,
                            styles.authenticationButton,
                        )}
                        isDisabled={authenticateButtonDisabled}
                        onPress={onCreateUserClick}
                    >
                        {t("login:register_button_title")}
                    </Button>

                    <Button
                        className={classNames(
                            styles.roundButton,
                            styles.authenticationButton,
                        )}
                        isDisabled={authenticateButtonDisabled}
                        onPress={onLoginCreate}
                    >
                        {t("login:login_button_title")}
                    </Button>

                    <h2>
                        {" "}
                        {loginLoading ? (
                            <span className={styles.loginLoadingText}>
                                Logging in...
                            </span>
                        ) : (
                            <span>
                                <br />
                            </span>
                        )}
                    </h2>
                </div>
            </Form>
        </div>
    );
}

export default function AuthenticationPage({
    onAuthDone,
}: {
    onAuthDone: (action: AuthAction) => void;
}) {
    const isLoggedIn = useIsLoggedIn();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageInnerContainer}>
                {isLoggedIn ? null : (
                    <Authenticate
                        onActionClicked={(action) => onAuthDone(action)}
                    />
                )}
            </div>
        </div>
    );
}
