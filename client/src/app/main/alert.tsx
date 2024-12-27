import { Box, Flex, Row, Text } from "../../components/ui/primitives";
import React from "react";
import { serviceMap } from "./screen";
import useMobile from "../../hooks/useMobile";
import { smooth } from "../../util/motion";
import { X } from "lucide-react";

interface AlertProps {
    children?: React.ReactNode;
    from: string;
    onClick?: () => void;
    onClose?: () => void;
}
const Alert = ({children, from, onClick, onClose}: AlertProps) => {
    const isMobile = useMobile();
    return <Box
        initial={{ x: "120%" }} animate={{ x: 0 }} exit={{ x: "120%" }} transition={smooth}
        $background='#fff4' $rounded='md' $width='full' className="noClose"
        style={{ cursor: isMobile ? "none" : "pointer", userSelect: "none", pointerEvents: "all" }} onClick={e => {
            (e.target as HTMLElement).classList.contains("noClose") && onClick && onClick();
        }}
    >
        <Row $gap='sm' $padding='sm' $items='start' className="noClose">
            <Flex $width='24px' className="noClose">
                {serviceMap[from] && React.createElement(serviceMap[from][1], { size: 24 })}
            </Flex>
            <Text $width="full" $size='body' className="noClose">{children}</Text>
            <Flex $width='24px'>
                <X size={24} onClick={onClose} />
            </Flex>
        </Row>
    </Box>
}

export default Alert;