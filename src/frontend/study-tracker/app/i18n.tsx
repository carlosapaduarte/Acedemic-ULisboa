// src/frontend/study-tracker/app/i18n.tsx
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    fallbackLng: "en",
    ns: ["calendar", "common", "homepage"], //
    defaultNS: "calendar",
    supportedLngs: ["en", "pt"],

    detection: {
      order: ["localStorage", "navigator"], // Prioriza o idioma guardado no localStorage, depois o do navegador
      caches: ["localStorage"], // Guarda o último idioma selecionado no localStorage

      convertDetectedLanguage: (lng) => lng.split("-")[0],
    },

    load: "languageOnly",

    interpolation: {
      escapeValue: false,
    },
    debug: false,
  });

export default i18n;

export const i18nConfig = {
  supportedLngs: ["en", "pt"],
  fallbackLng: "en",
  defaultNS: "calendar",
};
