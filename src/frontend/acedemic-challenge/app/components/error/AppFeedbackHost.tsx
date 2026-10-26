import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import {
    FaCircleCheck,
    FaCircleExclamation,
    FaCircleInfo,
    FaXmark,
} from "react-icons/fa6";
import { useAppFeedback, useAppFeedbackState } from "./GlobalErrorContainer";
import styles from "./AppFeedbackHost.module.css";

type BadgeNotificationEvent = CustomEvent<{ title: string }>;

export function AppFeedbackHost() {
    const { t } = useTranslation(["common"]);
    const { notify } = useAppFeedback();
    const {
        notification,
        dismissNotification,
        confirmation,
        resolveConfirmation,
    } = useAppFeedbackState();
    const titleId = useId();
    const messageId = useId();

    useEffect(() => {
        const onBadgeNotification = (event: Event) => {
            const { title } = (event as BadgeNotificationEvent).detail;
            notify({ type: "success", message: t("common:new_badge", { title }) });
        };
        window.addEventListener("app:badge-notification", onBadgeNotification);
        return () => window.removeEventListener("app:badge-notification", onBadgeNotification);
    }, [notify, t]);

    useEffect(() => {
        if (!notification) return;
        const duration = notification.duration ?? (notification.type === "error" ? 8000 : 4500);
        const timer = window.setTimeout(dismissNotification, duration);
        return () => window.clearTimeout(timer);
    }, [notification, dismissNotification]);

    const NotificationIcon =
        notification?.type === "success"
            ? FaCircleCheck
            : notification?.type === "error"
                ? FaCircleExclamation
                : FaCircleInfo;

    return (
        <>
            {notification && (
                <div
                    className={`${styles.notification} ${styles[notification.type]}`}
                    role={notification.type === "error" ? "alert" : "status"}
                    aria-live={notification.type === "error" ? "assertive" : "polite"}
                    aria-atomic="true"
                >
                    <NotificationIcon className={styles.notificationIcon} aria-hidden="true" />
                    <p>{notification.message}</p>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={dismissNotification}
                        aria-label={t("common:close")}
                    >
                        <FaXmark aria-hidden="true" />
                    </button>
                </div>
            )}

            <ModalOverlay
                className={styles.confirmOverlay}
                isOpen={Boolean(confirmation)}
                isDismissable
                onOpenChange={(isOpen) => !isOpen && resolveConfirmation(false)}
            >
                <Modal className={styles.confirmModal}>
                    <Dialog aria-labelledby={titleId} aria-describedby={messageId}>
                        {confirmation && (
                            <>
                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={() => resolveConfirmation(false)}
                                    aria-label={t("common:close")}
                                >
                                    <FaXmark aria-hidden="true" />
                                </button>
                                <h2 id={titleId}>{confirmation.title}</h2>
                                <p id={messageId}>{confirmation.message}</p>
                                <div className={styles.confirmActions}>
                                    <Button
                                        className={styles.cancelButton}
                                        onPress={() => resolveConfirmation(false)}
                                    >
                                        {confirmation.cancelLabel}
                                    </Button>
                                    <Button
                                        className={`${styles.confirmButton} ${confirmation.danger ? styles.dangerButton : ""}`}
                                        onPress={() => resolveConfirmation(true)}
                                    >
                                        {confirmation.confirmLabel}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
}