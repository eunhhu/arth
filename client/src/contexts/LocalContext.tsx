import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface LocalContextProps {
    lang: string;
    setLang: Dispatch<SetStateAction<string>>;
}

const LocalContext = createContext<LocalContextProps|undefined>(undefined);

const LocalProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState<string>('');

    useEffect(() => {
        const localLang = localStorage.getItem('lang');
        if (localLang) setLang(localLang);
    }, []);

    useEffect(() => localStorage.setItem('lang', lang), [lang]);

    return (
        <LocalContext.Provider value={{ lang, setLang }}>
            {children}
        </LocalContext.Provider>
    );
}

const useLocal = () => {
    const context = useContext(LocalContext);

    if (!context) {
        throw new Error('useLocal must be used within a LocalProvider');
    }

    return context;
}

export { LocalProvider, useLocal };