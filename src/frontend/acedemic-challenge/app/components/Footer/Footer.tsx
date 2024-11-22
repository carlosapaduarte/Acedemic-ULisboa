import styles from "./footer.module.css";
import { useTranslation } from "react-i18next";

export function Footer({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
    const { t } = useTranslation(["common"]);

    return (
        <footer className={styles.footer} aria-hidden={ariaHidden}>
            <img src={"./ulisboa_horizontal_logo_negative.png"} alt={t("common:ulisboa_logo")} className={styles.leftSide} />
            <img src={"./sucesso_logo_negative.png"} alt={t("common:sucesso_academico_ulisboa_logo")}
                 className={styles.rightSide} />
        </footer>
    );
}