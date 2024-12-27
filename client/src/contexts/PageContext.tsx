import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Socket } from "socket.io-client";

interface PageContextProps {
    page: string;
    setPage: Dispatch<SetStateAction<string>>;
}

const PageContext = createContext<PageContextProps|undefined>(undefined);

const PageProvider = ({ children }: { children: React.ReactNode }) => {
    const [page, setPage] = useState<string>('lock');

    return (
        <PageContext.Provider value={{ page, setPage }}>
            {children}
        </PageContext.Provider>
    );
}

const usePage = () => {
    const context = useContext(PageContext);

    if (!context) {
        throw new Error('usePage must be used within a PageProvider');
    }

    return context;
}

export { PageProvider, usePage };