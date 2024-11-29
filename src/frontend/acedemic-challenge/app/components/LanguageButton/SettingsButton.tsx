import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLogOut } from "~/components/auth/Authn";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import dropdownStyles from "~/components/AppBar/HomeAppBar/dropdown.module.css";

function Dropdown({ trigger }: { trigger: JSX.Element }) {
    const logout = useLogOut();
    const [isPending, startTransition] = useTransition();

    return (<DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                {trigger}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className={dropdownStyles.Content} sideOffset={5}>
                    {/*<DropdownMenu.Item className={dropdownStyles.Item}>
                        <a href="/settings"
                           aria-label={t("appbar:settings")}
                           className={classNames(styles.settingsButton)}
                           onClick={(e) => {
                               e.preventDefault();
                               navigate("/settings");
                           }}>
                            Settings
                        </a>
                    </DropdownMenu.Item>*/}
                    <DropdownMenu.Item className={dropdownStyles.Item}>
                        <a href="/"
                           aria-label={"Acedemic Home"}
                           className={classNames(dropdownStyles.acedemicHomeItem)}>
                            Acedemic Home
                        </a>
                    </DropdownMenu.Item>
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

export function SettingsButton() {
    const navigate = useNavigate();

    const { t } = useTranslation("appbar");

    return (
        <Dropdown trigger={
            <a href="/settings"
               aria-label={t("appbar:settings")}
               className={classNames(styles.settingsButton)}
               onClick={(e) => {
                   e.preventDefault();
                   navigate("/settings");
               }}>
                <IconContext.Provider value={{
                    className: classNames(styles.settingsButtonIcon)
                }}>
                    <RiSettings5Fill />
                </IconContext.Provider>
            </a>
        } />
    );
}