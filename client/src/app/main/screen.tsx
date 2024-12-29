import React, { useEffect, useRef, useState } from 'react';
import { Column, Container, Input, Row, Text } from '../../components/ui/primitives';
import useSocket from '../../hooks/useSocket';
import useMobile from '../../hooks/useMobile';
import { CloudIcon, DatabaseIcon, MessageCircleIcon, CpuIcon, MusicIcon, YoutubeIcon, ImagesIcon, TerminalIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ServiceItem from './serviceItem';
import SystemScreen from './system/screen';
import Navigator from './navigator';
import CloudScreen from './cloud/screen';
import FloatAlerts from './floatAlerts';
import AlertSection from './alertSection';
import { useAlert } from '../../contexts/AlertContext';
import DatabaseScreen from './database/screen';

const edgeEventSize = 40;
const maxEventSize = 200;
const autoHandle = 0.4;

export const serviceMap:Record<string, [string, any]> = {
    'cloud': ['Cloud', CloudIcon],
    'database': ['Database', DatabaseIcon],
    'system': ['System', CpuIcon],
    'terminal': ['Terminal', TerminalIcon],
    'zone': ['Zone', MessageCircleIcon],
    'gallery': ['Gallery', ImagesIcon],
    'music': ['Music', MusicIcon],
    'youtube': ['Youtube', YoutubeIcon],
}

const MainScreen = () => {
    const isMobile = useMobile();
    const {alerts, setAlerts, surfaceAlerts, setSurfaceAlerts} = useAlert();
    const [wAlert, setWalert] = useState(0);
    const [startX, setStartX] = useState<number | null>(null);
    const [startY, setStartY] = useState<number | null>(null);
    const [page, setPage] = useState('');
    const [search, setSearch] = useState('');
    const realHeightRef = useRef<HTMLDivElement|null>(null);
    const [realHeight, setRealHeight] = useState(realHeightRef.current?.getBoundingClientRect().height);

    useEffect(() => {
        const resize = () => setRealHeight(realHeightRef.current?.getBoundingClientRect().height);
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        setRealHeight(realHeightRef.current?.getBoundingClientRect().height);
    }, [realHeightRef.current?.getBoundingClientRect().height, page]);

    const socket = useSocket('/app');

    useEffect(() => {
        socket.on("alert", (data: AlertMessage) => {
            setAlerts(prev => [...prev, data]);
            setSurfaceAlerts(prev => [...prev, data.id]);
        });
        socket.on("connect", () => {
            const randId = Math.random().toString(36).substring(7);
            setAlerts(prev => [...prev, { id: randId, from: 'main', message: 'Connected to server' }]);
            setSurfaceAlerts(prev => [...prev, randId]);
        });
        socket.on("disconnect", () => {
            const randId = Math.random().toString(36).substring(7);
            setAlerts(prev => [...prev, { id: randId, from: 'main', message: 'Disconnected from server' }]);
            setSurfaceAlerts(prev => [...prev, randId]);
        });
    }, [socket, alerts]);

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
        <Container ref={realHeightRef}><AnimatePresence>{
            page === 'cloud' ? <CloudScreen h={`${realHeight}px`} key="cloud" /> :
            page === 'database' ? <DatabaseScreen h={`${realHeight}px`} key="database" /> :
            page === 'system' ? <SystemScreen h={`${realHeight}px`} key="system" /> :
            <Container $absolute key="main" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: .1 }}>
                <Column $padding='2md' $gap='md'>
                    <Input
                        placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}
                        $background='surface' $border='1px outline solid' $padding='md' $rounded='sm' $color='content' $width='full'
                    />
                </Column>
                <Container $scroll $center>
                    <Row $wrap='wrap' $padding='0 2md' $gap='md' style={{ maxHeight: "100%" }}>
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
        <AlertSection wAlert={wAlert} setWalert={setWalert} setPage={setPage} setStartX={setStartX} />
        <FloatAlerts setWalert={setWalert} />
        </Container>
    );
};

export default MainScreen;