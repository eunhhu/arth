import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Socket } from "socket.io-client";

interface GlobalContextProps {
    page: string;
    setPage: Dispatch<SetStateAction<string>>;
}

const GlobalContext = createContext<GlobalContextProps|undefined>(undefined);

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const [page, setPage] = useState<string>('lock');

    return (
        <GlobalContext.Provider value={{ page, setPage }}>
            {children}
        </GlobalContext.Provider>
    );
}

const useGlobal = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }

    return context;
}

export { GlobalProvider, useGlobal };