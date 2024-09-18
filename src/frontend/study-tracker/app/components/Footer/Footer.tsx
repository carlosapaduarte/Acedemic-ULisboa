import styles from "./footer.module.css";

export function Footer() {
    return (
        <div className={styles.footer}>
            <img src={"./ulisboa_horizontal_logo_positive.png"} alt={"ULisboa Logo"} className={styles.leftSide} />
            <img src={"./sucesso_logo_positive.png"} alt={"Sucesso no Ensino Superior Logo"}
                 className={styles.rightSide} />
        </div>
    );
}