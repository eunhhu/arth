import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PageProvider } from './contexts/PageContext';
import { LocalProvider } from './contexts/LocalContext';
import App from './app/app';
import "./styles/global.css";
import { AlertProvider } from './contexts/AlertContext';

const Index = () => {
    useEffect(() => {
        document.scrollingElement.scrollTo({top: 0});
    }, [])
    return <PageProvider>
        <LocalProvider>
            <AlertProvider>
                <App />
            </AlertProvider>
        </LocalProvider>
    </PageProvider>
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index />);
