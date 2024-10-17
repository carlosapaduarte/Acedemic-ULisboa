import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";

export function Progress() {
    const setError = useSetGlobalError();
    const [progress, setProgress] = useState<number | undefined>(undefined);

    useEffect(() => {
        service.getDailyTasksProgress()
            .then((prog: number) => setProgress(prog))
            .catch((error) => setError(error));
    });

    return (
        <>
            <h1>Daily Tasks Progress</h1>
            <p>Porgress: {progress}</p>
        </>
    );
}