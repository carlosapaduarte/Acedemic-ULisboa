import * as React from 'react'
import {useError} from "./ErrorContainer";
import { t } from 'i18next';


export function ErrorController({ children }: { children: React.ReactNode }): React.ReactElement {
    const error = useError()

    if (error === undefined) {
        return <>{children}</>
    } else {
        console.log("Error: " + error.message)
        return (
            <div>
                <h3>{t("error:title")}</h3>
                <h4>{error.message}</h4>
            </div>
        );
    }
}