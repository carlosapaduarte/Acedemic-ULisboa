export function notifyNewBadge(title: string) {
    window.dispatchEvent(
        new CustomEvent("app:badge-notification", { detail: { title } }),
    );
}
