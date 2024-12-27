import React from "react";
import { Box, Flex, Text } from "../../../components/ui/primitives";
import useMobile from "../../../hooks/useMobile";

interface ProgresserProps {
    value: number;
    children?: React.ReactNode;
}
const Progresser = ({ value, children }: ProgresserProps) => {
    const isMobile = useMobile();

    return <Flex $direction={isMobile ? "column" : "row"} $gap="md">
        <Text $size="body" $width={isMobile ? "full" : "40%"}>{children}</Text>
        <Box $width={isMobile ? "full" : "60%"} $height="md" $rounded="md" $background="surface">
            <Box $background="content" $width={value + "%"} $height="full" $rounded="md" style={{transition: "width .2s ease"}} />
        </Box>
    </Flex>
}

export default Progresser;