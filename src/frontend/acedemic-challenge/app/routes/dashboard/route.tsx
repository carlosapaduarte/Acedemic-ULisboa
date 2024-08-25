import styles from "./dashboard.module.css";
import { Button } from "~/components/Button";
import { useNavigate } from "@remix-run/react";
import { useLogOut } from "~/components/auth/Authn";

export default function DashboardPage() {
    const navigate = useNavigate();
    const logOut = useLogOut();

    return (
        <div className={`${styles.pageContainer}`}>
            <div className={`${styles.pageInnerContainer}`}>
                <h1>Dashboard</h1>
                <p>Welcome to Dashboard</p>
                <Button variant={"round"}
                        className={styles.logoutButton}
                        onClick={() => {
                            logOut();
                            navigate("/");
                        }}
                >Log out</Button>
            </div>
        </div>
    );
}
