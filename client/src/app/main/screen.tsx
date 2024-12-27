import React, { useEffect, useRef, useState } from 'react';
import { Box, Column, Container, Float, Image, Input, Row, Text } from '../../components/ui/primitives';
import useSocket from '../../hooks/useSocket';
import useMobile from '../../hooks/useMobile';
import { CloudIcon, DatabaseIcon, MessageCircleIcon, CpuIcon, MusicIcon, YoutubeIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ServiceItem from './serviceItem';
import { cvt } from '../../util/styler';

const edgeEventSize = 40;
const maxEventSize = 200;
const autoHandle = 0.4;

const serviceMap:Record<string, [string, any]> = {
    'cloud': ['Cloud Storage', CloudIcon],
    'database': ['Database', DatabaseIcon],
    'system': ['System Info', CpuIcon],
    'zone': ['Zone', MessageCircleIcon],
    'music': ['Music', MusicIcon],
    'youtube': ['Youtube', YoutubeIcon],
}

const MainScreen = () => {
    const isMobile = useMobile();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [wAlert, setWalert] = useState(0);
    const [startX, setStartX] = useState<number | null>(null);
    const [startY, setStartY] = useState<number | null>(null);
    const [page, setPage] = useState('');
    const [search, setSearch] = useState('');

    const socket = useSocket('/app');

    useEffect(() => {
        socket.on("alert", (data: any) => {
            setAlerts(prev => [...prev, data]);
        });
    }, [socket]);

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
        >{
            page === 'cloud' ? null :
            <>
            <Column $padding='2md' $gap='md'>
                <Input
                placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}
                $background='surface' $border='1px outline solid' $padding='md' $rounded='sm' $color='content' $width='full'
                />
            </Column>
            <Container $scroll $center>
                <Row $wrap='wrap'>
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
            </>
        }
        <Float $position="top-right" $distance='md' $height='full - md * 2' $width='32xs'
            style={{ transform: `translateX(calc(${100 - wAlert * 100}% + var(--md) * ${1 - wAlert}))`, transition: 'transform 0.1s' }}
            transition={{ duration: 0, ease: "easeInOut" }}
            onTouchStart={(e) => {
                if (!isMobile) return;
                if (!(e.target as HTMLElement).classList.contains("draggable")) return;
                setStartX(innerWidth);
                setWalert(1);
            }}
        >
            <Box  className='draggable' $background='surface' $border='1px outline solid' $padding='md' $rounded='md' $height='full'>
            <Text>하이</Text>
            </Box>
        </Float>
        </Container>
    );
};

export default MainScreen;