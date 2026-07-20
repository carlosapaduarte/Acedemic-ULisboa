import styles from "./footer.module.css";
import { useTranslation } from "react-i18next";

interface FooterProps {
  "aria-hidden"?: boolean;
  isLightContext?: boolean;
}

export function Footer({
  "aria-hidden": ariaHidden,
  isLightContext = false,
}: FooterProps) {
  const { t } = useTranslation(["common"]);

  return (
    <footer className={styles.footer} aria-hidden={ariaHidden}>
      <img
        src={isLightContext ? "./ulisboa_horizontal_logo_negative.png" : "./ulisboa_horizontal_logo_positive.png"}
        alt={t("common:ulisboa_logo")}
        className={styles.leftSide}
      />

      <div className={styles.middleSide}>
        <img 
          src={isLightContext ? "./logos_parceiros_branco.png" : "./logos_parceiros_preto.png"} 
          alt="Parceiros" 
        />
      </div>

      <img
        src={isLightContext ? "./sucesso_logo_negative.png" : "./sucesso_logo_positive.png"}
        alt={t("common:sucesso_academico_ulisboa_logo")}
        className={styles.rightSide}
      />
    </footer>
  );
}