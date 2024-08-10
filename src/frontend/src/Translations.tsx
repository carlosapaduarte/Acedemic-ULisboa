import {initReactI18next} from "react-i18next";
import i18next from "i18next";


//import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

i18next
    .use(initReactI18next) // passes i18n down to react-i18next
    //.use(I18nextBrowserLanguageDetector)
    .init({
        // the translations
        // (tip move them in a JSON file and import them,
        // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
        resources: {
            en: {
                translation: {
                },
                "hello_quote": {
                    "night": "Good Night",
                    "morning": "Good Morning",
                    "afternoon": "Good Afternoon",
                    "evening": "Good Evening"
                },
                "welcome_page": {
                    "title": "Welcome Page",
                    "description": "Imagine what it would be like to transform your academic performance in three weeks... Seems impossible? Studies show that it only takes 21 days to change or implement a habit. The '21 Days Self-Efficacy Challenge' harnesses that science to help you create more effective study habits and, with that, change your academic trajectory. Are you ready to make the most of your university experience? Start today and see the difference 21 days can make!",
                    "proceed": "Proceed"
                },
                "not_found_page": {
                    "title": "Page not found",
                    "description": "We couldn't find the page you were looking for.",
                    "go_to_home": "Go to Home",
                },
                "dashboard": {
                    "main_message": "Best way to break a habit is to drop it",
                    "current_challenge": "Today's Challenges",
                    "my_notes": "My Notes",
                    "add_note": "Add A Note",
                    "confirm_new_note": "Submit",
                    "mark_complete": "Mark Complete",
                    "goal_completed": "Objective Complete!"
                },
                "error": {
                    "title": "An Error Occurred"
                }
            },
            pt: {
                translation: {
                },
                "hello_quote": {
                    "night": "Boa Noite",
                    "morning": "Bom Dia",
                    "afternoon": "Boa Tarde",
                    "evening": "Boa Noite"
                },
                "welcome_page": {
                    "title": "Página de Boas-vindas",
                    "description": "Imagina o que seria transformares o teu desempenho académico em três semanas... Parece-te impossível? Estudos mostram que são apenas necessários 21 dias para mudar ou implementar um hábito. O “21 Days Challenge da Autoeficácia” aproveita essa ciência para te ajudar a criar hábitos de estudo mais eficazes e, com isso, mudar a tua trajetória académica. Estás pronto para aproveitar ao máximo tua experiência universitária? Começa hoje e vê a diferença que 21 dias podem fazer!",
                    "proceed": "Prosseguir"
                },
                "not_found_page": {
                    "title": "Página não encontrada",
                    "description": "Não conseguimos encontrar a página que procura.",
                    "go_to_home": "Vá para a Página Inicial",
                },
                "dashboard": {
                    "main_message": "A melhor maneira de quebrar um hábito é largá-lo",
                    "current_challenge": "Objetivos Para Hoje",
                    "my_notes": "As Minhas Notas",
                    "add_note": "Adicionar Uma Nota",
                    "confirm_new_note": "Adicionar Nota",
                    "mark_complete": "Marcar Como Completo",
                    "goal_completed": "Objetivo Completo!"
                },
                "error": {
                    "title": "Ocorreu um erro"
                }
            }
        },
        lng: "pt", // if you're using a language detector, do not define the lng option
        fallbackLng: "en",

        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    });