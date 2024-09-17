import { useTranslation } from "react-i18next";

function ErrorViewer({ error }: { error: string }) {
    const { t } = useTranslation(["error"]);

    return (
        <div>
            <h3>{t("error:title")}</h3>
        </div>
    );
}