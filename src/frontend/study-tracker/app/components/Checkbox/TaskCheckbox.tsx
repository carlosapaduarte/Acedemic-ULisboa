import classNames from "classnames";
import styles from "./checkbox.module.css";

export function TaskCheckbox(
    { checked, onClick, className }:
        {
            checked: boolean,
            onClick: () => void,
            className?: string
        }
) {
    return (
        <button aria-checked={checked}
                aria-label={`Mark task as done`}
                role={"checkbox"}
                className={classNames(
                    styles.checkBox,
                    checked && styles.checked,
                    className
                )}
                onClick={onClick}
        >
        </button>
    );
}