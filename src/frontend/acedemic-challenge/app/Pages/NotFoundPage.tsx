import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";

/**
 * Page not found component.
 */
export function NotFoundPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                <h1 className="text-4xl font-bold text-secondary">404</h1>
                <h4 className="text-2xl text-white">
                    {t("not_found_page:title")}
                </h4>

                <h4 className="text-xl text-white">
                    {t("not_found_page:description")}
                </h4>

                <button
                    className="h-16 w-40 rounded bg-secondary text-xl font-medium hover:bg-secondary/85"
                    //startIcon={<HomeIcon/>}
                    onClick={() => navigate("/")}
                >
                    {t("not_found_page:go_to_home")}
                </button>
            </div>
        </div>
    );
}
