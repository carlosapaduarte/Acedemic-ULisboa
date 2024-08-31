import { useEffect } from "react"
import { BinaryAnswer, service } from "~/service/service"
import { useSetError } from "../error/ErrorContainer";

export function ReceiveNotificationsPreferenceSelection({onProceed} : {onProceed: () => void}) {
    const setError = useSetError();

    function submitReceiveNotPref(answer: BinaryAnswer) {
        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
        service.updateReceiveNotificationsPreference(userId, answer)
            .then(() => onProceed())
            .catch((error) => setError(error));
    }

    return (
        <div className="flex flex-col">
            <h1>Receive Notifications</h1>
            <div className="flex flex-col">
                <button onClick={() => submitReceiveNotPref(BinaryAnswer.YES)}>
                    Yes
                </button>
                <button onClick={() => submitReceiveNotPref(BinaryAnswer.NO)}>
                    No
                </button>
            </div>
        </div>
    )

}