import React from "react";
import { Box, Container, Float } from "../../components/ui/primitives";
import { AnimatePresence } from "framer-motion";
import Alert from "./alert";
import useMobile from "../../hooks/useMobile";
import { useAlert } from "../../contexts/AlertContext";
import { serviceMap } from "./screen";

interface AlertSectionProps {
    wAlert: number;
    setWalert: React.Dispatch<React.SetStateAction<number>>;
    setPage: React.Dispatch<React.SetStateAction<string>>;
    setStartX: React.Dispatch<React.SetStateAction<number | null>>;
}
const AlertSection = ({ wAlert, setWalert, setPage, setStartX }: AlertSectionProps) => {
    const { alerts, setAlerts, setSurfaceAlerts } = useAlert();
    const isMobile = useMobile();
    return <Float $position="right" $height='full' $width='36xs' $padding='md'
        style={{ transform: `translateX(${100 - wAlert * 100}%)`, transition: 'transform 0.1s' }}
        transition={{ duration: 0, ease: "easeInOut" }}
        onTouchStart={(e) => {
            if (!isMobile) return;
            if (!(e.target as HTMLElement).classList.contains("draggable")) return;
            setStartX(innerWidth);
            setWalert(1);
        }}
    >
        <Box className='draggable' $background='#fff1' $border='1px outline solid' $padding='md' $rounded='md' $height='full'
            style={{backdropFilter: 'blur(4px)'}}
        >
            <Container $scroll $center $gap='md' $rounded='md' className='draggable'>
                <AnimatePresence>
                    {alerts.map((alert, i) => {
                        const revoker = (prev: AlertMessage[]) => prev.filter((a, j) => a.id !== alert.id)
                        const idxRevoker = (prev: string[]) => prev.filter((id, j) => id !== alert.id)
                        return <Alert key={alert.id} from={alert.from} progress={alert.progress}
                        onClose={() => {
                            if(alert.progress === undefined || alert.progress === 1){
                                setAlerts(revoker)
                                setSurfaceAlerts(idxRevoker)
                            }
                        }}
                        onClick={() => {
                            setWalert(0)
                            if(serviceMap[alert.from]) setPage(alert.from)
                            setSurfaceAlerts(idxRevoker)
                            if(alert.progress === undefined || alert.progress === 1) setAlerts(revoker)
                        }}
                        >{alert.message}</Alert>
                    })}
                </AnimatePresence>
            </Container>
        </Box>
    </Float>
}

export default AlertSection;