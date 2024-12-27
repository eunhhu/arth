import React from 'react';
import { Box, Column, Row, Text } from '../../components/ui/primitives';
import { ArrowBigLeftDashIcon } from 'lucide-react';
import useMobile from '../../hooks/useMobile';
import { smooth } from '../../util/motion';
import { serviceMap } from './screen';

interface NavigatorProps {
    label: string;
    title: string;
    onBack?: () => void;
}
const Navigator = ({ label, title, onBack }: NavigatorProps) => {
    const isMobile = useMobile();
    return <Box $width='full' $bb='1px outline solid' initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={smooth}>
        <Row $padding='md' $gap='md'>
            <Column $width='4xs' $height='4xs' onClick={onBack} style={{ cursor: isMobile ? "none" : "pointer", userSelect: "none"}}>
                <ArrowBigLeftDashIcon size={32} />
            </Column>
            <Column $width='4xs' $height='4xs'>
                {React.createElement(serviceMap[label][1], { size: 32 })}
            </Column>
            <Text $width='full' $size='headline'>{title}</Text>
        </Row>
    </Box>
}

export default Navigator;