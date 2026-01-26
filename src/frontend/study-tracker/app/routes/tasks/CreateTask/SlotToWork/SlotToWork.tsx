import React, { useContext, useEffect, useState } from "react";
import { Button, Dialog, Input, Label, TextField } from "react-aria-components";
import styles from "./slotToWork.module.css";
import classNames from "classnames";
import { SecondModalContext } from "~/routes/tasks/CreateTask/SecondModalContext";
import { useTranslation } from "react-i18next";
import { SlotToWorkDto } from "~/service/output_dtos";

const formatDate = (
  dateString: string | undefined,
  locale: string = "en-US",
  t: any
) => {
  if (!dateString) return t("task:unset_date");
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (
  timeString: string | undefined,
  locale: string = "en-US"
) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric",
  });
};

const formatTimes = (
  startTimeString: string | undefined,
  endTimeString: string | undefined,
  locale: string = "en-US",
  t: any
) => {
  if (!startTimeString || !endTimeString) return t("task:unset_time_range");
  return t("task:time_range", {
    startTime: formatTime(startTimeString, locale),
    endTime: formatTime(endTimeString, locale),
  });
};

function ModalContent({
  index,
  initialDate,
  initialStartTime,
  initialEndTime,
  onConfirm,
  onCancel,
}: {
  index: number;
  initialDate: string | undefined;
  initialStartTime: string | undefined;
  initialEndTime: string | undefined;
  onConfirm: (data: { date: string; start: string; end: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(["task"]);

  const [tempDate, setTempDate] = useState<string>(initialDate || "");
  const [tempStartTime, setTempStartTime] = useState<string>(
    initialStartTime || ""
  );
  const [tempEndTime, setTempEndTime] = useState<string>(initialEndTime || "");

  const [showError, setShowError] = useState(false);

  const handleSave = (closeDialog: () => void) => {
    if (!tempDate || !tempStartTime || !tempEndTime) {
      setShowError(true);
      return;
    }

    onConfirm({
      date: tempDate,
      start: tempStartTime,
      end: tempEndTime,
    });

    closeDialog();
  };

  const handleCancel = (closeDialog: () => void) => {
    onCancel();
    closeDialog();
  };

  const isInvalid = (value: string | undefined) => showError && !value;

  return (
    <Dialog
      id={`secondModal-slotWork-${index}`}
      aria-labelledby={`slotToWork-button-${index}`}
    >
      {({ close }) => (
        <div className={styles.modalContainer}>
          <Button
            className={classNames(styles.closeButton)}
            onPress={() => handleCancel(close)}
          >
            {t("task:cancel", "Cancelar")}
          </Button>

          <h1 className={styles.mainFormModalTitleText}>
            {t("task:slot_to_work", { number: index + 1 })}
          </h1>

          {showError && (
            <p className={styles.errorText}>
              {t(
                "task:fill_all_fields",
                "Preencha todos os campos obrigatórios."
              )}
            </p>
          )}

          <div className={styles.slotFormContainer}>
            <TextField autoFocus>
              <Label className={styles.formSectionTitle}>
                {t("task:slot_date_to_work")}
              </Label>
              <Input
                type="date"
                value={tempDate}
                onChange={(e) => {
                  setTempDate(e.target.value);
                  if (e.target.value) setShowError(false);
                }}
                className={classNames(styles.dateInput, {
                  [styles.inputError]: isInvalid(tempDate),
                })}
              />
            </TextField>
            <TextField>
              <Label className={styles.formSectionTitle}>
                {t("task:slot_starting_time")}
              </Label>
              <Input
                type="time"
                value={tempStartTime}
                onChange={(e) => {
                  setTempStartTime(e.target.value);
                  if (e.target.value) setShowError(false);
                }}
                className={classNames(styles.timeInput, {
                  [styles.inputError]: isInvalid(tempStartTime),
                })}
              />
            </TextField>
            <TextField>
              <Label className={styles.formSectionTitle}>
                {t("task:slot_ending_time")}
              </Label>
              <Input
                type="time"
                value={tempEndTime}
                onChange={(e) => {
                  setTempEndTime(e.target.value);
                  if (e.target.value) setShowError(false);
                }}
                className={classNames(styles.timeInput, {
                  [styles.inputError]: isInvalid(tempEndTime),
                })}
              />
            </TextField>
          </div>

          {/* BOTÃO CONFIRMAR */}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              className={styles.confirmButton}
              onPress={() => handleSave(close)}
            >
              {t("task:confirm", "Confirmar")}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function SlotToWork({
  index,
  newlyAdded,
  onClosePressed,
}: {
  index: number;
  newlyAdded: boolean;
  onClosePressed: (slot: SlotToWorkDto | undefined) => void;
}) {
  const { t } = useTranslation(["task"]);
  const {
    setIsSecondModalOpen,
    isSecondModalOpen,
    setSecondModalContent,
    setSecondModalClass,
  } = useContext(SecondModalContext);

  const [date, setDate] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);

  const [userLocale, setUserLocale] = useState<string>("en-US");
  useEffect(() => {
    setUserLocale(navigator.language || "en-US");
  }, []);

  const handleConfirm = (data: {
    date: string;
    start: string;
    end: string;
  }) => {
    setDate(data.date);
    setStartTime(data.start);
    setEndTime(data.end);

    const createValidDate = (dateStr: string, timeStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = timeStr.split(":").map(Number);
      const newDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      return isNaN(newDate.getTime()) ? undefined : newDate;
    };

    const startObj = createValidDate(data.date, data.start);
    const endObj = createValidDate(data.date, data.end);

    if (startObj && endObj) {
      onClosePressed({ start: startObj, end: endObj });
    }
  };

  const handleCancel = () => {
    onClosePressed(undefined);
    setIsSecondModalOpen(false);
  };

  const openModal = () => {
    setIsSecondModalOpen(true);
    setSecondModalClass(styles.slotToWorkModal);
    setSecondModalContent(
      <ModalContent
        index={index}
        initialDate={date}
        initialStartTime={startTime}
        initialEndTime={endTime}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  };

  useEffect(() => {
    if (isSecondModalOpen) {
    }
  }, [date, startTime, endTime]);

  const formattedDate = formatDate(date, userLocale, t);
  const formattedTimes = formatTimes(startTime, endTime, userLocale, t);

  return (
    <Button
      className={styles.slotToWorkButton}
      id={`slotToWork-button-${index}`}
      aria-label={`${t("task:slot_to_work", {
        number: index + 1,
      })} - ${formattedDate}, ${formattedTimes}`}
      data-newly-added={newlyAdded}
      onPress={openModal}
    >
      <div className={styles.slotToWorkText}>
        <span style={{ textWrap: "nowrap" }}>
          {date ? (
            <span>{formattedDate}</span>
          ) : (
            <span style={{ opacity: "0.7" }}>{t("task:unset_date")}</span>
          )}
          {", "}
        </span>
        <span style={{ textWrap: "nowrap" }}>
          {startTime && endTime ? (
            <span>{formattedTimes}</span>
          ) : (
            <span style={{ opacity: "0.7" }}>{t("task:unset_time_range")}</span>
          )}
        </span>
      </div>
    </Button>
  );
}
