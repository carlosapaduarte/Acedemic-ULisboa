import classNames from "classnames";
import styles from "./energy.module.css";
import { useEffect, useState } from "react"
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer"
import { DailyEnergyStatus, service } from "~/service/service"
import { utils } from "~/utils";

function EnergyStatus({status} : {status: DailyEnergyStatus}) {
    return (
        <div>
            <p>(O)</p>
            <span>Today, {status.date.getDate()} {status.date.toLocaleString('default', { month: 'long' })}</span>
        </div>
    )
}

function EnergyStatusHistory({energyHistory} : {energyHistory: DailyEnergyStatus[]}) {
    return (
        <>
            <div className={styles.historyFirstContainer}>
                <span className={styles.historyTitle}>History</span>
                <span className={styles.seeFullHistoryText}>(O) See full history</span>
            </div>

            <div className={styles.historyStatusAndDate}>
                {energyHistory.map((value: DailyEnergyStatus) => 
                    <EnergyStatus status={value} />
                )}
            </div>
        </>
    )
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

function TodayDate() {
    const today = new Date()
    return (
        <div className={styles.todayDate}>
            Today, {today.getDate()} {today.toLocaleString('default', { month: 'long' })}
        </div>
    )
}

function TodayEnergyStatus({status} : {status: DailyEnergyStatus | undefined}) {
    return (
        <>
            <TodayDate />
            <br/><br/>
            {status ?
                <span className={classNames(levelToColor(status.level), styles.todayEnergyStatusTitle)}>
                    (SYMBOL) I feel {levelToStr(status.level)}
                </span>
                :
                <p>Nothing</p>
            }

            <br/><br/>

            <span>
                TAGS
            </span>
        </>
    )
}

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

export function EnergyStats() {
    const {
        energyHistory, 
        getTodayEnergyStatus
    } = useEnergyStats()
    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statTitle}>
                    (O) Energy
                </div>
                <TodayEnergyStatus status={getTodayEnergyStatus()} />
                
                <br/><br/>

                <EnergyStatusHistory energyHistory={energyHistory ? energyHistory.slice(0, 6) : []} />
            </div>
        </>
    )
}