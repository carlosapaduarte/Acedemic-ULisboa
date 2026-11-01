export function notifyNewBadge(title: string, code?: string) {
    window.dispatchEvent(
        new CustomEvent("app:badge-notification", { detail: { title, code } }),
    );
}
