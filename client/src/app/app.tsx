import React from 'react';
import { PageProvider, usePage } from '../contexts/PageContext';
import { Container, Text } from '../components/ui/primitives';
import { AnimatePresence } from 'framer-motion';
import LockScreen from './lockscreen';
import ErrorScreen from './errorscreen';
import MainScreen from './main/screen';
import { smooth } from '../util/motion';

const App = () => {
    const { page, setPage } = usePage();
    return <Container $background='background'>
        <AnimatePresence>
            <Container $absolute key={page} initial={{ opacity: .5, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: .5, y: "-100%" }} transition={smooth}>
                {
                    page === 'lock' ? <LockScreen />:
                    page === 'main' ? <MainScreen />:
                    <ErrorScreen />
                }
            </Container>
        </AnimatePresence>
    </Container>
};

export default App;