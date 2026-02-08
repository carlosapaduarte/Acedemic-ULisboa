import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";

function useWelcomePage() {
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();

  const handleOnProceedClick = () => {
    if (!isLoggedIn) {
      navigate("/log-in");
    }
  };

  return { isLoggedIn, handleOnProceedClick };
}

export default function WelcomePage() {
  useAppBar("clean");

  const { t } = useTranslation(["welcome_page"]);
  const { isLoggedIn, handleOnProceedClick } = useWelcomePage();

  if (isLoggedIn == true || isLoggedIn == undefined) {
    return null;
  }

  return (
    <div className={classNames(styles.welcomePage)}>
      <h1>
        {t("welcome_page:hello_message")}
        <br />
        {t("welcome_page:login_to_continue")}
      </h1>
      <br />
      {/* Botão Login Normal */}
      <button className={styles.roundButton} onClick={handleOnProceedClick}>
        {t("welcome_page:login")}
      </button>

      {/* Botão Login ULisboa */}
      <div style={{ marginTop: "15px" }}>
        <a
          href="https://acedemic.studentlife.ulisboa.pt/api/auth/ulisboa/login?target=tracker"
          className={styles.roundButton}
          style={{
            display: "inline-block",
            backgroundColor: "#374151",
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          Login ULisboa
        </a>
      </div>
    </div>
  );
}
