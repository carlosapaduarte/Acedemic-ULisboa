import { initReactI18next } from "react-i18next";
import i18next from "i18next";
//import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18next
    .use(Backend)
    .use(initReactI18next) // passes i18n down to react-i18next
    //.use(I18nextBrowserLanguageDetector)
    .init({
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json"
        },
        /*resources: { },*/
        lng: "pt", // if you're using a language detector, do not define the lng option
        fallbackLng: "en",

        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });