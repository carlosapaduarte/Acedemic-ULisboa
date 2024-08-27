import { useIsLoggedIn } from "~/components/auth/Authn";
import WelcomePage from "~/routes/_index/WelcomePage/WelcomePage";
import HomePage from "~/routes/_index/Home/HomePage";

export default function IndexPage() {
    const isLoggedIn = useIsLoggedIn();

    if (isLoggedIn == undefined) {
        return <h1 style={{ color: "white" }}>Loading...</h1>;
    }

    if (!isLoggedIn) {
        return <WelcomePage />;
    }

    return <HomePage />;
}