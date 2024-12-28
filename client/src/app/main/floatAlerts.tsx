import React from 'react';
import { Column, Float } from '../../components/ui/primitives';
import { AnimatePresence } from 'framer-motion';
import Alert from './alert';
import { useAlert } from '../../contexts/AlertContext';

interface FloatAlertsProps {
    setWalert: React.Dispatch<React.SetStateAction<number>>;
}
const FloatAlerts = ({setWalert}: FloatAlertsProps) => {
    const { alerts, setAlerts, surfaceAlerts, setSurfaceAlerts } = useAlert();
    return <Float $position="right" $height='full' $width='36xs' $padding='md'
        style={{ pointerEvents: 'none'}}
    >
        <Column $justify='flex-end' $gap='md' $height='full'>
            <AnimatePresence>
                {surfaceAlerts.map((alertId, i) => {
                    const alert = alerts.find(alert => alert.id === alertId);
                    return alert && <Alert key={alert.id} from={alert.from} progress={alert.progress}
                        onClick={() => setWalert(1)}
                        onClose={() => {
                            if(alert.progress === undefined || alert.progress === 1) setSurfaceAlerts((prev: string[]) => prev.filter((id, j) => id !== alertId))
                            setAlerts((prev: AlertMessage[]) => prev.filter((a, j) => a.id !== alertId))
                        }}
                    >{alert.message}</Alert>
                })}
            </AnimatePresence>
        </Column>
    </Float>
}

export default FloatAlerts;