import classNames from "classnames";
import styles from "./statistics.module.css";
import { useEffect, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { DailyEnergyStatus, service } from "~/service/service";
import { utils } from "~/utils";
import { NoDataYetAvailableMessage, SeeFullHistory, Spacer } from "./Commons";
import { useTranslation } from "react-i18next";

export function getEnergyIconByEnergyLevel(energyLevel: number): string {
    const prefix = "icons/";
    let filename = "";
    if (energyLevel >= 4) filename = "energy_very_well_icon.png";
    else if (energyLevel >= 3) filename = "energy_well_icon.png";
    else if (energyLevel >= 2) filename = "energy_bad_icon.png";
    else filename = "energy_very_bad_icon.png";

    return prefix + filename;
}

export function levelToStr(level: number): string {
    if (level >= 4) return "energy_very_well";
    if (level >= 3) return "energy_well";
    if (level >= 2) return "energy_bad";
    return "energy_very_bad";
}

function levelToColor(level: number): string {
    if (level >= 4) return styles.veryWellColor;
    if (level >= 3) return styles.wellColor;
    if (level >= 2) return styles.badColor;
    return styles.veryBadColor;
}

function EnergyStatus({ status }: { status: DailyEnergyStatus }) {
    return (
        <div className={styles.textAndIconContainer}>
            <img src={getEnergyIconByEnergyLevel(status.level)} alt="Energy Status Icon"
                 className={styles.energyHistoryStatusIcon} />
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
                            const lower = status1.date < status2.date;
                            if (lower)
                                return -1;
                            else {
                                if (status1.date > status2.date)
                                    return 1;

                                return 0;
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

function TodayDate() {
    const { t } = useTranslation(["statistics"]);
    const today = new Date();
    return (
        <div className={styles.containerHeaderDate}>
            {t("statistics:today")}, {today.getDate()} {today.toLocaleString("default", { month: "long" })}
        </div>
    );
}

//const tags = ["sleep well", "sports", "healthy food", "sun", "friends"]

function Tags({ dailyTags }: { dailyTags: string[] }) {
    return (
        <div className={styles.tagsContainer}>
            {
                dailyTags.map((tag: string, index: number) =>
                    <span key={index} className={styles.energyTag}>{tag} </span>
                )
            }
        </div>
    );
}

function TodayEnergyStatus({ status, dailyTags }: { status: DailyEnergyStatus | undefined, dailyTags: string[] }) {
    const { t } = useTranslation(["statistics"]);
    return (
        <>
            {status ?
                <div className={classNames(levelToColor(status.level), styles.todayEnergyStatusTitle)}>
                    <img src={getEnergyIconByEnergyLevel(status.level)} alt="Energy Status Icon"
                         className={styles.icon} />
                    {`${t("statistics:i_feel")} ${t(`statistics:${levelToStr(status.level)}`)}`}
                </div>
                :
                <NoDataYetAvailableMessage />
            }
            <Spacer />
            <Tags dailyTags={dailyTags} />
        </>
    );
}

function useEnergyStats() {
    const setError = useSetGlobalError();
    const [energyHistory, setEnergyHistory] = useState<DailyEnergyStatus[] | undefined>(undefined);
    const [dailyTags, setDailyTags] = useState<string[]>([]);

    useEffect(() => {
        service.fetchEnergyHistory()
            .then((value) => setEnergyHistory(value))
            .catch((error) => setError(error));

        service.getDailyTags()
            .then((tags) => setDailyTags(tags.slice(0, 5)))
            .catch((error) => setError(error));
    }, []);

    function getTodayEnergyStatus(): DailyEnergyStatus | undefined {
        //console.log(energyHistory)
        return energyHistory?.find((value) => utils.sameDay(value.date, new Date()));
    }

    return {
        energyHistory,
        getTodayEnergyStatus,
        dailyTags
    };
}

export function EnergyStats() {
    const { t } = useTranslation(["statistics"]);
    const {
        energyHistory,
        getTodayEnergyStatus,
        dailyTags
    } = useEnergyStats();

    function onSeeFullHistoryClickHandler() {
        // VIEW NOT YET AVAILABLE
    }

    return (
        <>
            <div className={styles.statsContainer}>
                <div className={styles.statsContainerTitleAndDateDiv}>
                    <div className={styles.statsContainerTitle}>
                        <img src="icons/energy_container_title_icon.png" alt="Energy Title Icon"
                             className={styles.titleImg} />
                        {t("statistics:energy_container_title")}
                    </div>
                    <TodayDate />
                </div>

                <TodayEnergyStatus status={getTodayEnergyStatus()} dailyTags={dailyTags} />

                <br /><br />

                <EnergyStatusHistory energyHistory={energyHistory ? energyHistory : []}
                                     onSeeFullHistoryClick={onSeeFullHistoryClickHandler} />
            </div>
        </>
    );
}