import React, { createContext, useContext, useState, useEffect } from "react";
import fr from "./fr.json";
import en from "./en.json";

type Lang = "fr" | "en";
type Translations = typeof fr;

const translations: Record<Lang, Translations> = { fr, en };

type I18nContextType = {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
    return path.split(".").reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) return acc[key];
        return path; // fallback to key if not found
    }, obj);
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLangState] = useState<Lang>(() => {
        const saved = localStorage.getItem("lang");
        return (saved === "fr" || saved === "en") ? saved : "fr";
    });

    const setLang = (l: Lang) => {
        localStorage.setItem("lang", l);
        setLangState(l);
    };

    const t = (key: string): string => {
        return getNestedValue(translations[lang], key) || key;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used within I18nProvider");
    return ctx;
};
