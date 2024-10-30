import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import { EnergyStats } from "./Energy";
import { FocusStats } from "./Focus";
import styles from "./statistics.module.css";
import { RequireAuthn } from "~/components/auth/RequireAuthn";

function WeekStats({ week, stats }: { week: string, stats: any }) {
    return (
        <div>
            <h1>{week}</h1>
            {stats ?
                Object.keys(stats).map(key =>
                    <div>
                        <p>Tag: {key}</p>
                        <p>Hours: {stats[key]}</p>
                    </div>
                )
                :
                <></>
            }
        </div>
    );
}

function YearStats({ year, stats }: { year: string, stats: any }) {
    return (
        <>
            <h1>{year}</h1>
            {stats ?
                Object.keys(stats).map(key =>
                    <WeekStats week={key} stats={stats[key]} />
                )
                :
                <></>
            }
        </>
    );
}

function TaskDistribution() {
    const setError = useSetGlobalError();
    const [stats, setStats] = useState<any | undefined>(undefined);

    console.log(stats);

    useEffect(() => {
        service.getTaskDistributionStats()
            .then((stats: any) => setStats(stats))
            .catch((error) => setError(error));
    }, []);

    return (
        <>
            {stats ?
                Object.keys(stats).map(key =>
                    <YearStats year={key} stats={stats[key]} />
                )
                :
                <></>
            }
        </>
    );
}

export default function Statistics() {
    return (
        <RequireAuthn>
            <div className={styles.pageTitleDiv}>
                <span className={styles.pageTitle}>
                    Statistics
                </span>
            </div>
            <EnergyStats />
            <br /><br />
            <FocusStats />
        </RequireAuthn>
    );
}