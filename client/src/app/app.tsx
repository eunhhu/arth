import React from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import { Container, Text } from '../components/ui/primitives';
import { AnimatePresence } from 'framer-motion';
import LockScreen from './lockscreen';
import ErrorScreen from './errorscreen';

const App = () => {
    const { page, setPage } = useGlobal();

    return <Container>
        <AnimatePresence>
            {
                page === 'lock' ? <LockScreen />:
                page === 'main' ? <Text>Main</Text>:
                page === 'settings' ? <Text>Settings</Text>:
                <ErrorScreen />
            }
        </AnimatePresence>
    </Container>
};

export default App;