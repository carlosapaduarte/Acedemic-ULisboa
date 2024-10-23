import classNames from "classnames";
import styles from "./statistics.module.css";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { DailyEnergyStatus, service } from "~/service/service";
import { utils } from "~/utils";
import { Spacer } from "./Commons";

function EnergyStatus({ status }: { status: DailyEnergyStatus }) {
    return (
        <div>
            <p>(O)</p>
            <span>{status.date.getDate()} {status.date.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}</span>
        </div>
    );
}

function EnergyStatusHistory({ energyHistory, onSeeFullHistoryClick }:
                                 {
                                     energyHistory: DailyEnergyStatus[],
                                     onSeeFullHistoryClick: () => void
                                 }) {
    return (
        <>
            <div className={styles.historyFirstContainer}>
                <span className={styles.historyTitle}>History</span>
                <button className={styles.seeFullHistoryText}>
                    (O) See full history
                </button>
            </div>

            <div className={styles.historyStatusAndDate}>
                {energyHistory.map((value: DailyEnergyStatus, index: number) =>
                    <EnergyStatus status={value} key={index} />
                )}
            </div>
        </>
    );
}

function levelToStr(level: number): string {
    if (level >= 9) return "Very Well";
    if (level >= 7) return "Well";
    if (level >= 5) return "bad";
    return "Very Bad";
}

function levelToColor(level: number): string {
    if (level >= 9) return styles.veryWellColor;
    if (level >= 7) return styles.wellColor;
    if (level >= 5) return styles.goodColor;
    return styles.badColor;
}

function TodayDate() {
    const today = new Date();
    return (
        <div className={styles.containerHeaderDate}>
            TODAY, {today.getDate()} {today.toLocaleString("default", { month: "long" })}
        </div>
    );
}

function getEnergyIconByEnergyLevel(energyLevel: number): string {
    const prefix = "/icons/"
    let filename = ""
    if (energyLevel >= 9) filename = "energy_very_good_icon.png";
    if (energyLevel >= 7) filename = "energy_good_icon.png";
    if (energyLevel >= 5) filename = "energy_bad_icon.png";
    filename = "energy_very_bad_icon.png";
    
    return prefix + filename
}

function TodayEnergyStatus({ status }: { status: DailyEnergyStatus | undefined }) {
    return (
        <>
            {status ?
                <div className={classNames(levelToColor(status.level), styles.todayEnergyStatusTitle)}>
                    <img src={getEnergyIconByEnergyLevel(status.level)} alt="Energy Status Icon" className={styles.icon}/>
                    I feel {levelToStr(status.level)}
                </div>
                :
                <p>Nothing</p>
            }

            <Spacer />

            <span>
                TAGS
            </span>
        </>
    );
}

function useEnergyStats() {
    const setError = useSetGlobalError();
    const [energyHistory, setEnergyHistory] = useState<DailyEnergyStatus[] | undefined>(undefined);

    useEffect(() => {
        service.fetchEnergyHistory()
            .then((value) => setEnergyHistory(value))
            .catch((error) => setError(error));
    }, []);

    function getTodayEnergyStatus(): DailyEnergyStatus | undefined {
        //console.log(energyHistory)
        return energyHistory?.find((value) => utils.sameDay(value.date, new Date()));
    }

    return {
        energyHistory,
        getTodayEnergyStatus
    };
}

export function EnergyStats() {
    const {
        energyHistory,
        getTodayEnergyStatus
    } = useEnergyStats();

    function onSeeFullHistoryClickHandler() {
        // VIEW NOT YET AVAILABLE
    }

    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitleAndDateDiv}>
                    <div className={styles.statsContainerTitle}>
                        <img src="/icons/energy_container_title_icon.png" alt="Energy Title Icon" className={styles.titleImg}/>
                        Energy
                    </div>
                    <TodayDate />
                </div>
                
                <TodayEnergyStatus status={getTodayEnergyStatus()} />

                <br /><br />

                <EnergyStatusHistory energyHistory={energyHistory ? energyHistory.slice(0, 6) : []}
                                     onSeeFullHistoryClick={onSeeFullHistoryClickHandler} />
            </div>
        </>
    );
}