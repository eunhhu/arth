import React from "react"
import { Box, Button, Column, Float, Input, Overlay, Row, TextArea } from "./primitives"
import { smooth } from "../../util/motion";
import { cvt } from "../../util/styler";

interface OverlayActionProps {
    value?: string;
    onChange?: (value: string) => void;
    isTextarea?: boolean;
    onCancel: () => void;
    actions: [string, () => void][];
}
const OverlayAction = ({value, onChange, isTextarea, onCancel, actions}: OverlayActionProps) => {
    return <Overlay initial={{backdropFilter: "blur(0)"}} animate={{backdropFilter: 'blur(5px)'}} exit={{backdropFilter: "blur(0)"}} transition={smooth}
        onPointerDown={(e) => e.target === e.currentTarget && onCancel()}
    >
        <Float $position="center" initial={{opacity: 0, scale: 0.5, x:"-50%", y:"-50%"}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.5}} transition={smooth}>
            <Box $rounded="md" $padding="md" $background="background" $border="1px outline solid">
                <Column $gap="md">
                    {onChange && (
                    isTextarea ?
                    <TextArea
                        $width="10xl" $height="4xl" $rounded="sm" $padding="sm" $background="surface" $border="1px outline solid"
                        value={value} onChange={e => onChange(e.target.value)}
                    />:
                    <Input
                        $width="10xl" $rounded="sm" $padding="sm" $background="surface" $border="1px outline solid"
                        value={value} onChange={e => onChange(e.target.value)}
                    />)}
                    <Row $gap="sm" $justify="between">
                        <Button $width="full" $rounded="sm" $padding="sm" $border="1px outline solid" $background="surface" onClick={onCancel}>Cancel</Button>
                        {actions.map(([label, action], i) =>
                            <Button key={i} $width="full" $rounded="sm" $padding="sm" $border="1px outline solid" $background="surface" onClick={action}>{label}</Button>
                        )}
                    </Row>
                </Column>
            </Box>
        </Float>
    </Overlay>
}

export default OverlayAction;