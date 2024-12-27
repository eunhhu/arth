import React, { useEffect, useState } from 'react';
import { Box, Column, Container, Float, Input, Row, Text } from '../../components/ui/primitives';
import useSocket from '../../hooks/useSocket';
import useMobile from '../../hooks/useMobile';
import { CloudIcon, DatabaseIcon, MessageCircleIcon, CpuIcon, MusicIcon, YoutubeIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ServiceItem from './serviceItem';
import Alert from './alert';
import SystemScreen from './system/screen';
import Navigator from './navigator';

const edgeEventSize = 40;
const maxEventSize = 200;
const autoHandle = 0.4;

export const serviceMap:Record<string, [string, any]> = {
    'cloud': ['Cloud', CloudIcon],
    'database': ['Database', DatabaseIcon],
    'system': ['System', CpuIcon],
    'zone': ['Zone', MessageCircleIcon],
    'music': ['Music', MusicIcon],
    'youtube': ['Youtube', YoutubeIcon],
}

interface AlertMessage {
    id: string;
    from: string;
    message: string;
}

const MainScreen = () => {
    const isMobile = useMobile();
    const [alerts, setAlerts] = useState<AlertMessage[]>([]);
    const [surfaceAlerts, setSurfaceAlerts] = useState<AlertMessage[]>([]);
    const [wAlert, setWalert] = useState(0);
    const [startX, setStartX] = useState<number | null>(null);
    const [startY, setStartY] = useState<number | null>(null);
    const [page, setPage] = useState('');
    const [search, setSearch] = useState('');

    const socket = useSocket('/app');

    useEffect(() => {
        socket.on("alert", (data: AlertMessage) => {
            setAlerts(prev => [...prev, data]);
            setSurfaceAlerts(prev => [...prev, data]);
        });
    }, [socket]);

    useEffect(() => {
        if (surfaceAlerts.length > 0) {
            const timer = setTimeout(() => {
                setSurfaceAlerts(prev => prev.slice(1));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [surfaceAlerts]);

    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPage('');
            if (e.key === 'Tab') {
                e.preventDefault();
                setWalert(prev => 1 - prev);
            }
        }
        document.addEventListener('keydown', keydown);
        return () => document.removeEventListener('keydown', keydown);
    }, [])

    useEffect(() => {
        if (wAlert === 1) setSurfaceAlerts([])
    }, [wAlert])

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        if(wAlert < 1){
            const x = e.touches[0].clientX;
            if (x >= innerWidth - edgeEventSize) setStartX(x);
        }
        const y = e.touches[0].clientY;
        if (y <= edgeEventSize) setStartY(y);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isMobile) return;
        if(startX !== null){
            const distX = e.touches[0].clientX - startX;
            const ratioX = Math.min(1, Math.max(0, - distX / maxEventSize));
            setWalert(ratioX);
        }
        if(startY !== null){
            const distY = e.touches[0].clientY - startY;
            const ratioY = Math.min(1, Math.max(0, distY / maxEventSize));
        }
    };

    const handleTouchEnd = () => {
        setStartX(null);
        setStartY(null);
        setWalert(wAlert >= autoHandle ? 1 : 0);
    };

    return (
        <Container
            $center
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
        {page && <Navigator label={page} title={serviceMap[page][0]} onBack={() => setPage("")} />}
        <Container><AnimatePresence>{
            page === 'system' ? <SystemScreen key="system" /> :
            <Container $absolute key="main" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: .1 }}>
                <Column $padding='2md' $gap='md'>
                    <Input
                    placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}
                    $background='surface' $border='1px outline solid' $padding='md' $rounded='sm' $color='content' $width='full'
                    />
                </Column>
                <Container $scroll $center>
                    <Row $wrap='wrap' $padding='0 2md' $gap='md'>
                    <AnimatePresence>
                        {Object.keys(serviceMap).map((key) => (
                        serviceMap[key][0].toLowerCase().includes(search.toLowerCase()) &&
                        <ServiceItem key={key} onClick={() => setPage(key)}>
                            {React.createElement(serviceMap[key][1], { size: 64 })}
                            <Text $align='center'>{serviceMap[key][0]}</Text>
                        </ServiceItem>
                        ))}
                    </AnimatePresence>
                    </Row>
                </Container>
            </Container>
        }</AnimatePresence></Container>
        <Float $position="right" $height='full' $width='36xs' $padding='md'
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
                            const revoker = (prev: AlertMessage[]) => prev.filter((_, j) => j !== i)
                            return <Alert key={alert.id} from={alert.from}
                            onClose={() => {
                                setAlerts(revoker)
                                setSurfaceAlerts(revoker)
                            }}
                            onClick={() => {
                                setWalert(0)
                                setAlerts(revoker)
                                setSurfaceAlerts(revoker)
                                setPage(alert.from)
                            }}
                            >{alert.message}</Alert>
                        })}
                    </AnimatePresence>
                </Container>
            </Box>
        </Float>
        <Float $position="right" $height='full' $width='36xs' $padding='md'
            style={{ pointerEvents: 'none'}}
        >
            <Column $justify='flex-end' $gap='md' $height='full'>
                <AnimatePresence>
                    {surfaceAlerts.map((alert, i) => <Alert key={alert.id} from={alert.from}
                        onClick={() => setWalert(1)}
                        onClose={() => {
                            const revoker = (prev: AlertMessage[]) => prev.filter((_, j) => j !== i)
                            setAlerts(revoker)
                            setSurfaceAlerts(revoker)
                        }}
                    >{alert.message}</Alert>)}
                </AnimatePresence>
            </Column>
        </Float>
        </Container>
    );
};

export default MainScreen;