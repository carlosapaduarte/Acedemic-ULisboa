import styles from "./footer.module.css";
import { useTranslation } from "react-i18next";

export function Footer({
  "aria-hidden": ariaHidden,
  isLightContext = false,
}: {
  "aria-hidden"?: boolean;
  isLightContext?: boolean; // ← A declaração que estava a faltar no TypeScript
}) {
  const { t } = useTranslation(["common"]);

  return (
    <footer 
      className={`${styles.footer} ${!isLightContext ? styles.blackLogos : ""}`} 
      aria-hidden={ariaHidden}
    >
      <img
        src={"./ulisboa_horizontal_logo_negative.png"}
        alt={t("common:ulisboa_logo")}
        className={styles.leftSide}
      />

      <div className={styles.middleSide}>
        <img src={"./logos_parceiros_branco.png"} alt="Parceiros" />
      </div>

      <img
        src={"./sucesso_logo_negative.png"}
        alt={t("common:sucesso_academico_ulisboa_logo")}
        className={styles.rightSide}
      />
    </footer>
  );
}