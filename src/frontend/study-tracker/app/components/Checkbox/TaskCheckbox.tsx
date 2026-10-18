import classNames from "classnames";
import styles from "./checkbox.module.css";

export function TaskCheckbox(
    { checked, onClick, className, ariaLabel = "Mark task as done", disabled = false }:
        {
            checked: boolean,
            onClick: () => void,
            className?: string,
            ariaLabel?: string,
            disabled?: boolean
        }
) {
    return (
        <button aria-checked={checked}
                aria-label={ariaLabel}
                role="checkbox"
                disabled={disabled}
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
