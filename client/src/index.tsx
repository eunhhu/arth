import React from 'react';
import ReactDOM from 'react-dom/client';
import { PageProvider } from './contexts/PageContext';
import { LocalProvider } from './contexts/LocalContext';
import App from './app/app';
import "./styles/global.css";

const Index = () => {
    return <PageProvider>
        <LocalProvider>
            <App />
        </LocalProvider>
    </PageProvider>
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index />);
