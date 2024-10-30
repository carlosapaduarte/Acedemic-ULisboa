import styles from "./footer.module.css";

export function Footer({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
    return (
        <footer className={styles.footer} aria-hidden={ariaHidden}>
            <img src={"./ulisboa_horizontal_logo_positive.png"} alt={"ULisboa Logo"} className={styles.leftSide} />
            <img src={"./sucesso_logo_positive.png"} alt={"Sucesso no Ensino Superior Logo"}
                 className={styles.rightSide} />
        </footer>
    );
}