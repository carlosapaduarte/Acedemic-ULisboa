import { useEffect } from "react";
import { useIsLoggedIn } from "~/components/auth/Authn";
import WelcomePage from "~/routes/_index/WelcomePage/WelcomePage";
import HomePage from "~/routes/_index/Home/HomePage";
import { service } from "~/service/service";

export default function IndexPage() {
    const isLoggedIn = useIsLoggedIn();
    useEffect(() => {
        if (isLoggedIn === true) {
            service.logUserAction("challenge", "page_view", "challenge_home");
        }
    }, [isLoggedIn]);

    if (isLoggedIn == undefined) {
        return <h1 style={{ color: "white" }}>Loading...</h1>;
    }

    if (!isLoggedIn) {
        return <WelcomePage />;
    }

    return <HomePage />;
}