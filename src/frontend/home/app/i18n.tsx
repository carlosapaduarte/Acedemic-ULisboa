//import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

/*i18next
    .use(Backend)
    .use(initReactI18next) // passes i18n down to react-i18next
    //.use(I18nextBrowserLanguageDetector)
    .init({
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json"
        },
        /!*resources: { },*!/
        lng: "pt", // if you're using a language detector, do not define the lng option
        fallbackLng: "en",
        defaultNS: "common",

        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });*/

export const i18nConfig = {
    supportedLngs: ["en", "pt"],
    fallbackLng: "en",
    defaultNS: "common"
};