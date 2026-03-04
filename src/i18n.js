import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';

// Sistem dilini alır, örn: 'en-US' -> 'en', 'tr-TR' -> 'tr'
const getSystemLanguage = () => {
    const language = navigator.language || navigator.userLanguage;
    return language.split('-')[0];
};

const userLang = getSystemLanguage();
const savedLang = localStorage.getItem('appLanguage');
// Eğer kullanıcı daha önce seçmişse onu al, yoksa sistem diline (TR/EN) bak
const initialLang = savedLang || (userLang === 'tr' ? 'tr' : 'en');

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            tr: { translation: tr }
        },
        lng: initialLang,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
