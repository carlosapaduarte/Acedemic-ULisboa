import { useTranslation } from "react-i18next";
import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";

export default function WelcomePage() {
    const { t } = useTranslation();
    const { handleOnChooseLevelClick } = useWelcomePage();

    return <div className="flex flex-row justify-center items-center h-full sm:h-1/2 w-full">
        <div className="flex flex-col justify-center items-center h-full w-full md:w-3/4 lg:w-1/2">
            <h1 className="text-4xl text-secondary font-bold">{t("welcome_page:title")}</h1>
            <h5 className="text-xl text-white">{t("welcome_page:description")}</h5>
            <button className="bg-secondary hover:bg-secondary/85 w-40 h-16 font-medium text-xl rounded"
                    onClick={handleOnChooseLevelClick}>{
                t("welcome_page:proceed")}
            </button>
        </div>
    </div>;
}

function useWelcomePage() {
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();

    const handleOnChooseLevelClick = () => {
        if (!isLoggedIn) {
            navigate("/log-in");
        } else {
            const cachedUserId = localStorage["userId"]; // TODO: use cache just for now
            navigate(`/dashboard/${cachedUserId}`);
        }
    };

    return { handleOnChooseLevelClick };
}