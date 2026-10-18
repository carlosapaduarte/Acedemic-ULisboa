import { service } from "~/service/service";

let customColors: string[] = [];
let loadPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let revision = 0;
const listeners = new Set<() => void>();

export const subscribeToCustomColors = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCustomColorsSnapshot = () => customColors;

const publish = (colors: string[]) => {
  customColors = colors;
  listeners.forEach((listener) => listener());
};

export const loadCustomColors = () => {
  if (!loadPromise) {
    const startingRevision = revision;
    loadPromise = service
      .fetchUserInfoFromApi()
      .then((user) => {
        const colors =
          user.custom_colors ||
          (user as any).customColors ||
          (user as any).colors ||
          [];
        if (Array.isArray(colors) && revision === startingRevision) {
          publish(colors);
        }
      })
      .catch((error) => {
        console.error("Erro user info:", error);
        loadPromise = null;
      });
  }
  return loadPromise;
};

export const saveCustomColors = async (
  update: (currentColors: string[]) => string[],
) => {
  await loadCustomColors();
  const colors = update(customColors);
  revision += 1;
  publish(colors);
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => service.updateUserCustomColors(colors))
    .then(() => undefined);
  return writeQueue;
};
