import { useSetError } from "~/components/error/ErrorContainer";
import { service } from "~/service/service";

export function ShareProgress({
    userId,
    onShareSelected,
}: {
    userId: number;
    onShareSelected: () => void;
}) {
    const setError = useSetError();

    async function selectShareProgressState(shareProgress: boolean) {
        await service
            .selectShareProgressState(userId, shareProgress)
            .then(() => onShareSelected())
            .catch((error) => setError(error));
    }

    return (
        <div className="flex h-full w-full flex-row items-center justify-center sm:h-1/2">
            <div className="mx-[5%] my-[10%] flex h-full w-full flex-col items-center justify-center md:w-3/4 lg:w-1/2">
                <h1 className="text-4xl font-bold text-secondary">
                    Do you want to share your progress?
                </h1>
                <br />
                <button
                    className="rnd-button mb-2 h-8"
                    onClick={() => selectShareProgressState(true)}
                >
                    Yes
                </button>
                <button
                    className="rnd-button h-8"
                    onClick={() => selectShareProgressState(false)}
                >
                    No
                </button>
            </div>
        </div>
    );
}