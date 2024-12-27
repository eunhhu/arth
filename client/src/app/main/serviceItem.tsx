import React from "react";
import { Box, Column } from "../../components/ui/primitives";
import { smooth } from "../../util/motion";

interface ServiceItemProps {
    children?: React.ReactNode;
    onClick?: () => void;
}
const ServiceItem = ({children, onClick}: ServiceItemProps) => {
    return <Box
        initial={{ opacity: 0, scale: .8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .8, y: 50 }}
        transition={smooth}
        $background='surface' $border='2px outline solid' $rounded='sm' $margin='md' $color='content' $width='10lg'
        style={{ cursor: 'pointer' }} onClick={onClick}
    >
        <Column $gap='sm' $padding='lg'>
            {children}
        </Column>
    </Box>
}


export default ServiceItem;