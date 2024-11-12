import classNames from "classnames";
import styles from "./statistics.module.css";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { DailyEnergyStatus, service } from "~/service/service";
import { utils } from "~/utils";
import { NoDataYetAvailableMessage, SeeFullHistory, Spacer } from "./Commons";
import { useTranslation } from "react-i18next";

export function getEnergyIconByEnergyLevel(energyLevel: number): string {
    const prefix = "/icons/"
    let filename = ""
    if (energyLevel >= 9) filename = "energy_very_good_icon.png";
    else if (energyLevel >= 7) filename = "energy_good_icon.png";
    else if (energyLevel >= 5) filename = "energy_bad_icon.png";
    else filename = "energy_very_bad_icon.png";
    
    return prefix + filename
}

function EnergyStatus({ status }: { status: DailyEnergyStatus }) {
    return (
        <div className={styles.textAndIconContainer}>
            <img src={getEnergyIconByEnergyLevel(status.level)} alt="Energy Status Icon" className={styles.energyHistoryStatusIcon}/>
            {status.date.getDate()} {status.date.toLocaleString("default", { month: "long" }).substring(0, 3).toUpperCase()}
        </div>
    );
}

function EnergyStatusHistory({ energyHistory, onSeeFullHistoryClick }:
                                 {
                                     energyHistory: DailyEnergyStatus[],
                                     onSeeFullHistoryClick: () => void
                                 }) {
    return (
        energyHistory.length != 0 ?
            <>
                <div className={styles.historyFirstContainer}>
                    <span className={styles.historyTitle}>History</span>
                    <SeeFullHistory />
                </div>

                <div className={styles.historyStatusAndDate}>
                    {energyHistory
                        .sort((status1: DailyEnergyStatus, status2: DailyEnergyStatus) => { // sorts by increasing year and week
                            const lower = status1.date < status2.date
                            if (lower)
                                return -1
                            else {
                                if (status1.date > status2.date)
                                    return 1

                                return 0
                            }
                        })
                        .reverse()
                        .slice(0, 6)
                        .reverse()
                        .map((value: DailyEnergyStatus, index: number) =>
                            <EnergyStatus status={value} key={index} />
                        )
                    }
                </div>
            </>
        :
            <NoDataYetAvailableMessage />
    );
}

export function levelToStr(level: number): string {
    if (level >= 9) return "Very Well";
    if (level >= 7) return "Well";
    if (level >= 5) return "bad";
    return "Very Bad";
}

function levelToColor(level: number): string {
    if (level >= 9) return styles.veryWellColor;
    if (level >= 7) return styles.goodColor;
    if (level >= 5) return styles.mediumColor;
    return styles.badColor;
}

function TodayDate() {
    const { t } = useTranslation(["statistics"]);
    const today = new Date();
    return (
        <div className={styles.containerHeaderDate}>
            {t("statistics:today")}, {today.getDate()} {today.toLocaleString("default", { month: "long" })}
        </div>
    );
}

const tags = ["sleep weel", "sports", "healthy food", "sun", "friends"]

function Tags() {
    return (
        <div className={styles.tagsContainer}>
            {
                tags.map((tag: string, index: number) => 
                    <span key={index} className={styles.energyTag}>{tag} </span>
                )
            }
        </div>
    )
}

function TodayEnergyStatus({ status }: { status: DailyEnergyStatus | undefined }) {
    const { t } = useTranslation(["statistics"]);
    return (
        <>
            {status ?
                <div className={classNames(levelToColor(status.level), styles.todayEnergyStatusTitle)}>
                    <img src={getEnergyIconByEnergyLevel(status.level)} alt="Energy Status Icon" className={styles.icon}/>
                    {t("statistics:i_feel")} {levelToStr(status.level)}
                </div>
                :
                <NoDataYetAvailableMessage />
            }
            <Spacer />
            <Tags/>
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
    const { t } = useTranslation(["statistics"]);
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
                        {t("statistics:energy_container_title")}
                    </div>
                    <TodayDate />
                </div>
                
                <TodayEnergyStatus status={getTodayEnergyStatus()} />

                <br /><br />

                <EnergyStatusHistory energyHistory={energyHistory ? energyHistory : []}
                                     onSeeFullHistoryClick={onSeeFullHistoryClickHandler} />
            </div>
        </>
    );
}