import React from "react"
import { Box, Button, Column, Float, Input, Overlay, Row } from "../../../components/ui/primitives"
import { smooth } from "../../../util/motion";

interface OverlayActionProps {
    value?: string;
    onChange?: (value: string) => void;
    onCancel: () => void;
    actions: [string, () => void][];
}
const OverlayAction = ({value, onChange, onCancel, actions}: OverlayActionProps) => {
    return <Overlay initial={{backdropFilter: "blur(0)"}} animate={{backdropFilter: 'blur(5px)'}} exit={{backdropFilter: "blur(0)"}} transition={smooth}
        onPointerDown={(e) => e.target === e.currentTarget && onCancel()}
    >
        <Float $position="center" initial={{opacity: 0, scale: 0.5, x:"-50%", y:"-50%"}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.5}} transition={smooth}>
            <Box $rounded="md" $padding="md" $background="background" $border="1px outline solid">
                <Column $gap="md">
                    {onChange && <Input
                        $width="10xl" $rounded="sm" $padding="sm" $background="surface" $border="1px outline solid"
                        value={value} onChange={e => onChange(e.target.value)}
                    />}
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