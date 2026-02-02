import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill, RiEqualizerLine } from "react-icons/ri";
import React, { useTransition } from "react";
import { AppBarVariant } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";
import { useLogOut } from "~/components/auth/Authn";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import dropdownStyles from "~/components/AppBar/HomeAppBar/dropdown.module.css";

function Dropdown({ trigger }: { trigger: JSX.Element }) {
  const logout = useLogOut();
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate(); // Hook para navegação

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={dropdownStyles.Content} sideOffset={5}>
          <DropdownMenu.Item className={dropdownStyles.Item}>
            <a
              href={"/"}
              aria-label={"Acedemic Home"}
              className={classNames(dropdownStyles.acedemicHomeItem)}
            >
              Acedemic Home
            </a>
          </DropdownMenu.Item>

          {/* LINK PARA A PÁGINA DE SETTINGS */}
          <DropdownMenu.Item
            className={dropdownStyles.Item}
            onSelect={() => navigate("/settings")} // Navega para a nova rota
            style={{
              cursor: "pointer",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <RiEqualizerLine />
            <span>Definições</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item className={dropdownStyles.Item}>
            <a
              href="mailto:fc58620@alunos.ciencias.ulisboa.pt?subject=Suporte%20Study%20Tracker"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "inherit",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <span>Contactar Suporte</span>
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Separator
            className={dropdownStyles.Separator}
            style={{ height: 1, backgroundColor: "#ccc", margin: "5px 0" }}
          />

          <DropdownMenu.Item
            className={dropdownStyles.Item}
            onClick={() => startTransition(logout)}
          >
            Logout
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className={dropdownStyles.Arrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function SettingsButton({
  variant = "default",
}: {
  variant?: AppBarVariant;
}) {
  const { t } = useTranslation("appbar");

  return (
    <Dropdown
      trigger={
        <button
          aria-label={t("appbar:settings")}
          className={classNames(styles.settingsButton)}
        >
          <IconContext.Provider
            value={{
              className: classNames(styles.settingsButtonIcon, styles[variant]),
            }}
          >
            <RiSettings5Fill />
          </IconContext.Provider>
        </button>
      }
    />
  );
}
