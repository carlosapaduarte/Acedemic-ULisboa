import classNames from "classnames";
import styles from "./energy.module.css";
import { useEffect, useState } from "react"
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer"
import { DailyEnergyStatus, service } from "~/service/service"
import { utils } from "~/utils";

function useEnergyStats() {
    const setError = useSetGlobalError()
    const [energyHistory, setEnergyHistory] = useState<DailyEnergyStatus[] | undefined>(undefined)

    useEffect(() => {
        service.fetchEnergyHistory()
            .then((value) => setEnergyHistory(value))
            .catch((error) => setError(error));
    }, [])

    function getTodayEnergyStatus(): DailyEnergyStatus | undefined {
        return energyHistory?.find((value) => utils.sameDay(value.date, new Date()))
    }

    return {
        energyHistory, 
        getTodayEnergyStatus
    }
}

function levelToStr(level: number): string {
    if (level >= 9) return "Very Well"
    if (level >= 7) return "Well"
    if (level >= 5) return "Good"
    return "Alive"
}

function levelToColor(level: number): string {
    if (level >= 9) return styles.verWellColor
    if (level >= 7) return styles.wellColor
    if (level >= 5) return styles.goodColor
    return styles.badColor
}

function TodayEnergyStatus({status} : {status: DailyEnergyStatus | undefined}) {
    return (
        <>
            {status ?
                <span className={classNames(levelToColor(status.level), styles.todayEnergyStatusTitle)}>
                    (SYMBOL) I feel {levelToStr(status.level)}
                </span>
                :
                <p>Nothing</p>
            }

            <br/><br/>

            <div>
                TAGS
            </div>
        </>
    )
}

export function EnergyStats() {
    const {
        energyHistory, 
        getTodayEnergyStatus
    } = useEnergyStats()
    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statTitle}>
                    Energy
                </div>
                <TodayEnergyStatus status={getTodayEnergyStatus()} />
            </div>
        </>
    )
}