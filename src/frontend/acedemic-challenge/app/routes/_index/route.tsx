import { useTranslation } from "react-i18next";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export default function WelcomePage() {
    const { t } = useTranslation();
    const { handleOnProceedClick } = useWelcomePage();

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="mx-4 my-8 flex h-[100%] w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                <h1 className="text-4xl font-bold text-secondary">
                    {t("welcome_page:title")}
                </h1>
                <h5 className="text-xl text-white">
                    {t("welcome_page:description")}
                </h5>
                <button
                    className="rnd-button h-16 w-40"
                    onClick={handleOnProceedClick}
                >
                    {t("welcome_page:proceed")}
                </button>
            </div>
        </div>
    );
}

function useWelcomePage() {
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            const cachedUserId = localStorage["userId"]; // TODO: use cache just for now
            navigate(`/dashboard/${cachedUserId}`);
        }
    }, []);

    const handleOnProceedClick = () => {
        if (!isLoggedIn) {
            navigate("/log-in");
        }
    };

    return { handleOnProceedClick };
}
