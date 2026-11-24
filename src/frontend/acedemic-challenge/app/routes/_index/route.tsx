import { useIsLoggedIn } from "~/components/auth/Authn";
import WelcomePage from "~/routes/_index/WelcomePage/WelcomePage";
import HomePage from "~/routes/_index/Home/HomePage";
import { useTranslation } from "react-i18next";

export default function IndexPage() {
    const { t } = useTranslation(["common"]);
    const isLoggedIn = useIsLoggedIn();
    if (isLoggedIn == undefined) {
        return <h1 style={{ color: "white" }}>{t("common:loading")}</h1>;
    }

    if (!isLoggedIn) {
        return <WelcomePage />;
    }

    return <HomePage />;
}