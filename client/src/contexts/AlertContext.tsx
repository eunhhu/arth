import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface AlertContextProps {
    alerts: AlertMessage[];
    setAlerts: Dispatch<SetStateAction<AlertMessage[]>>;
    surfaceAlerts: string[];
    setSurfaceAlerts: Dispatch<SetStateAction<string[]>>;
}

const AlertContext = createContext<AlertContextProps|undefined>(undefined);

const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertMessage[]>([]);
    const [surfaceAlerts, setSurfaceAlerts] = useState<string[]>([]);

    return (
        <AlertContext.Provider value={{ alerts, setAlerts, surfaceAlerts, setSurfaceAlerts }}>
            {children}
        </AlertContext.Provider>
    );
}

const useAlert = () => {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error('useAlert must be used within a AlertProvider');
    }

    return context;
}

export { AlertProvider, useAlert };