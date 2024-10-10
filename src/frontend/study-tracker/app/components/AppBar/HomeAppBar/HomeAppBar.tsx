import styles from "./homeAppBar.module.css";
import React, { useEffect, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLogOut } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import dropdownStyles from "./dropdown.module.css";
import { service, UserInfo } from "~/service/service";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";

/**
 * Determines initial quote to be displayed to user, based on current time of day.
 */
function getHelloQuote(): string {
    const { t } = useTranslation(["hello_quote"]);

    const hourOfDay = new Date().getHours();
    switch (true) {
        case hourOfDay < 5:
            return t("hello_quote:night");
        case hourOfDay < 12:
            return t("hello_quote:morning");
        case hourOfDay < 17:
            return t("hello_quote:afternoon");
        case hourOfDay < 20:
            return t("hello_quote:evening");
        default:
            return t("hello_quote:night");
    }
}

function NavBarButton({ text, url }: { text: string, url: string }) {
    const navigate = useNavigate();

    return (
        <div className={`${styles.navBarButtonContainer}`}>
            <button
                onClick={() => navigate(url)}
                className={`${styles.cutButton} ${styles.navBarButton}`}
            >
                Icon
            </button>
            <div className={`${styles.navBarButtonText}`}>
                {text}
            </div>
        </div>
    );
}

function Dropdown({ trigger }: { trigger: JSX.Element }) {
    const logout = useLogOut();
    const [isPending, startTransition] = useTransition();

    return (<DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                {trigger}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className={dropdownStyles.Content} sideOffset={5}>
                    <DropdownMenu.Item className={dropdownStyles.Item}
                                       onClick={() => startTransition(logout)}>
                        Logout
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className={dropdownStyles.Arrow} />
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export function GreetingsContainer() {
    const setError = useSetGlobalError();

    const [username, setUsername] = React.useState<string | undefined>(undefined);
    const [avatarFilename, setAvatarFilename] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        service.fetchUserInfoFromApi()
            .then((userInfo: UserInfo) => {
                setAvatarFilename(userInfo.avatarFilename);
                setUsername(userInfo.username);
            })
            .catch((e: Error) => setError(e));
    }, []);


    let helloQuote = getHelloQuote();

    return (
        <div className={styles.greetingsContainer}>
            <h4 className={styles.helloQuote}>
                {username ?
                    <span>{helloQuote}, {username}</span>
                    : <span>Loading...</span>
                }
            </h4>
            <div className={`${styles.avatarAndDropdownContainer}`}>
                <Dropdown trigger={
                    <button className={`${styles.avatarContainer}`}>
                        <img
                            src={`${avatarFilename}`}
                            height="100px"
                            alt={`User's Avatar`}
                        />
                    </button>
                } />
            </div>
        </div>
    );
}

export function NavBar() {
    return (
        <div className={`${styles.navBar}`}>
            <NavBarButton text="Calendar" url={"/calendar"} />
            <NavBarButton text="Schedule" url={"/calendar"} />
            <NavBarButton text="Tasks" url={"/tasks"} />
            <NavBarButton text="Notes" url={"/archives"} />
            <NavBarButton text="Study!" url={"/timer"} />
            <NavBarButton text="Statistics" url={"/statistics"} />
            <NavBarButton text="Badges" url={"/badges"} />
        </div>
    );
}