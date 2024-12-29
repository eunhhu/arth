import React, { useEffect, useState } from 'react';
import { Box, Column, Float } from './primitives';
import useMobile from '../../hooks/useMobile';

interface SidebarProps {
    children: React.ReactNode;
    width: string;
    edgeEventSize?: number;
    maxEventSize?: number;
    autoHandle?: number;
}
const Sidebar = ({
    children,
    width,
    edgeEventSize = 40,
    maxEventSize = 200,
    autoHandle = .4
}: SidebarProps) => {
    const isMobile = useMobile();
    const [windowed, setWindowed] = useState<number>(0);
    const [startX, setStartX] = useState<number | null>(null);

    const handleTouchStart = (e: TouchEvent) => {
        if (windowed === 1) return;
        const x = e.touches[0].clientX;
        if (edgeEventSize >= x) setStartX(x);
    }
    const handleTouchMove = (e: TouchEvent) => {
        if (startX === null) return;
        const distX = e.touches[0].clientX - startX;
        const ratioX = Math.min(1, Math.max(0, distX / maxEventSize));
        setWindowed(ratioX);
    }
    const handleTouchEnd = () => {
        setStartX(null);
        setWindowed(windowed >= autoHandle ? 1 : 0);
    }

    useEffect(() => {
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        }
    }, [windowed, startX]);

    useEffect(() => {
        if (isMobile) setWindowed(0);
        else setWindowed(1);
    }, [isMobile]);

    return <Column $absolute={isMobile} $width={width} $height='full' className='draggable'
        style={{ transform: `translateX(${-100 + windowed * 100}%)`, transition: 'transform .1s' }}
        onTouchStart={(e) => {
            if (!isMobile) return;
            if (!(e.target as HTMLElement).classList.contains('draggable')) return;
            setStartX(0);
            setWindowed(1);
        }}
    >
        <Box className='draggable' $width='full' $height='full' $background='surface' $br='1px outline solid' $padding='md'>
            {children}
        </Box>
    </Column>
}

export default Sidebar;