import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { FaXmark } from "react-icons/fa6";
import {
  Button,
  Dialog,
  Popover,
} from "react-aria-components";
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
  const popoverRef = useRef<HTMLElement>(null);
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
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      if (rootRef.current?.contains(document.activeElement)) {
        buttonRef.current?.focus();
      }
      setOpenMode("dismissed");
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        buttonRef.current?.focus();
        setOpenMode("dismissed");
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const dismiss = () => setOpenMode("dismissed");
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpenMode((mode) => (mode === "dismissed" ? "automatic" : mode));
    } else {
      dismiss();
    }
  };

  const handlePointerLeave = (relatedTarget: EventTarget | null) => {
    const nextTarget = relatedTarget as Node | null;
    if (
      nextTarget &&
      (rootRef.current?.contains(nextTarget) ||
        popoverRef.current?.contains(nextTarget))
    ) {
      return;
    }

    setIsHovered(false);
    setOpenMode((mode) =>
      mode === "dismissed" && !hasFocus ? "automatic" : mode,
    );
  };

  const handleBlur = (relatedTarget: EventTarget | null) => {
    const nextTarget = relatedTarget as Node | null;
    if (
      nextTarget &&
      (rootRef.current?.contains(nextTarget) ||
        popoverRef.current?.contains(nextTarget))
    ) {
      return;
    }

    setHasFocus(false);
    setOpenMode((mode) =>
      mode === "dismissed" && !isHovered ? "automatic" : mode,
    );
  };

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
          handlePointerLeave(event.relatedTarget);
        }
      }}
      onFocusCapture={() => {
        setHasFocus(true);
        setOpenMode((mode) =>
          mode === "dismissed" && !isHovered ? "automatic" : mode,
        );
      }}
      onBlurCapture={(event) => handleBlur(event.relatedTarget)}
    >
      <Button
        ref={buttonRef}
        className={classNames(styles.infoPopoverTrigger, className)}
        aria-label={buttonLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onPress={() =>
          setOpenMode((mode) =>
            mode === "pinned" ? "dismissed" : "pinned",
          )
        }
      >
        i
      </Button>
      <Popover
        ref={popoverRef}
        triggerRef={buttonRef}
        className={styles.infoPopover}
        placement="bottom start"
        offset={8}
        shouldFlip
        containerPadding={16}
        isOpen={isOpen}
        isNonModal
        onOpenChange={handleOpenChange}
      >
        <div
          className={styles.infoPopoverContent}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setIsHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") {
              handlePointerLeave(event.relatedTarget);
            }
          }}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={(event) => handleBlur(event.relatedTarget)}
        >
          <Dialog
            id={panelId}
            aria-label={buttonLabel}
            className={styles.infoPopoverDialog}
          >
            <p id={contentId} className={styles.infoPopoverText}>
              {content}
            </p>
            <Button
              type="button"
              className={styles.infoPopoverClose}
              aria-label={t("task:close")}
              onPress={() => {
                buttonRef.current?.focus();
                dismiss();
              }}
            >
              <FaXmark aria-hidden="true" />
            </Button>
          </Dialog>
        </div>
      </Popover>
    </span>
  );
}
