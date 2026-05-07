import styles from "./homeAppBar.module.css";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";

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

function NavBarButton({ text, url }: { text: string; url: string }) {
  const navigate = useNavigate();

  return (
    <div className={`${styles.navBarButtonContainer}`}>
      <button
        onClick={() => navigate(url)}
        className={`${styles.cutButton} ${styles.navBarButton}`}
      >
        Icon
      </button>
      <div className={`${styles.navBarButtonText}`}>{text}</div>
    </div>
  );
}

export function GreetingsContainer() {
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);

  useEffect(() => {
    service.fetchUserInfoFromApi().then((fetchedUserInfo: UserInfo) => {
      setUserInfo(fetchedUserInfo);
    });
  }, []);

  let helloQuote = getHelloQuote();

  return (
    <div className={styles.greetingsContainer}>
      
      <h4 className={styles.helloQuote}>
        {userInfo ? (
          <span>
            {/* Mostramos o displayName. Se não existir, usamos o username */}
            {helloQuote}, {userInfo.displayName || userInfo.username}
          </span>
        ) : (
          <span>A carregar...</span>
        )}
      </h4>
      <div
        className={`${styles.avatarAndDropdownContainer} tutorial-target-avatar`}
      >
        <div className={`${styles.avatarContainer}`}>
          {userInfo?.avatarFilename && (
            <img
              src={`./avatars/${userInfo.avatarFilename.split("/").pop()}`}
              width={92}
              height={92}
              alt="User Avatar"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </div>
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
