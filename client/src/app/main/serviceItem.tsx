import React from "react";
import { Box, Column } from "../../components/ui/primitives";
import { smooth } from "../../util/motion";
import useMobile from "../../hooks/useMobile";

interface ServiceItemProps {
    children?: React.ReactNode;
    onClick?: () => void;
}
const ServiceItem = ({children, onClick}: ServiceItemProps) => {
    const isMobile = useMobile();
    return <Box
        initial={{ opacity: 0, scale: .8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .8, y: 50 }}
        transition={smooth}
        $background='surface' $border='2px outline solid' $rounded='sm' $color='content' $width='24xs'
        style={{ cursor: isMobile ? "none" : "pointer", userSelect: "none" }} onClick={onClick}
    >
        <Column $gap='sm' $padding='lg'>
            {children}
        </Column>
    </Box>
}


export default ServiceItem;