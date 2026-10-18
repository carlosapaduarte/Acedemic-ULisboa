import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { FaXmark } from "react-icons/fa6";
import styles from "./infoPopover.module.css";

type OpenMode = "automatic" | "pinned" | "dismissed";

export function InfoPopover({
  content,
  buttonLabel,
  className,
}: {
  content: string;
  buttonLabel: string;
  className?: string;
}) {
  const { t } = useTranslation(["task"]);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const contentId = useId();
  const [openMode, setOpenMode] = useState<OpenMode>("automatic");
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const isOpen =
    openMode === "pinned" ||
    (openMode === "automatic" && (isHovered || hasFocus));

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        if (rootRef.current?.contains(document.activeElement)) {
          buttonRef.current?.focus();
        }
        setOpenMode("dismissed");
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMode("dismissed");
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <span
      ref={rootRef}
      className={styles.infoPopoverRoot}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setIsHovered(true);
          setOpenMode((mode) =>
            mode === "dismissed" && !hasFocus ? "automatic" : mode,
          );
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          setIsHovered(false);
          setOpenMode((mode) =>
            mode === "dismissed" && !hasFocus ? "automatic" : mode,
          );
        }
      }}
      onFocusCapture={() => {
        setHasFocus(true);
        setOpenMode((mode) =>
          mode === "dismissed" && !isHovered ? "automatic" : mode,
        );
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && rootRef.current?.contains(nextTarget)) return;

        setHasFocus(false);
        setOpenMode((mode) =>
          mode === "dismissed" && !isHovered ? "automatic" : mode,
        );
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={className}
        aria-label={buttonLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-describedby={contentId}
        onClick={() =>
          setOpenMode((mode) =>
            mode === "pinned" ? "dismissed" : "pinned",
          )
        }
      >
        i
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label={buttonLabel}
        className={classNames(styles.infoPopover, isOpen && styles.open)}
        hidden={!isOpen}
      >
        <p id={contentId} className={styles.infoPopoverText}>
          {content}
        </p>
        <button
          type="button"
          className={styles.infoPopoverClose}
          aria-label={t("task:close")}
          onClick={() => {
            buttonRef.current?.focus();
            setOpenMode("dismissed");
          }}
        >
          <FaXmark aria-hidden="true" />
        </button>
      </div>
    </span>
  );
}
