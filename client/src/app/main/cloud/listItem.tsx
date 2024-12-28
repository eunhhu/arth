import React, { CSSProperties } from 'react';
import { Box, Column, Row, Text } from '../../../components/ui/primitives';
import { formatBytes, parseTimestampToDate } from '../../../util/parser';
import useMobile from '../../../hooks/useMobile';
import ItemIcon from './itemIcon';
import { CheckSquare2Icon, SquareIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface ListItemProps {
    file: FileInfo;
    selected: string[];
    selectMode: boolean;
    onClick: () => void;
    selectedOnClick: () => void;
    onForceSelect: () => void;
}
const ListItem = ({ file, selected, selectMode, onClick, selectedOnClick, onForceSelect }: ListItemProps) => {
    const isMobile = useMobile();
    const buttonProps:CSSProperties = { cursor: isMobile ? "none" : "pointer", userSelect: "none" }
    const isSelected = selected.includes(file.path);
    return <Box $width='full' $background={isSelected ? 'surface' : 'transparent'}>
        <Row $gap="md" $padding="xs md" style={buttonProps} onClick={(e) => {
            if(!selectMode) onClick();
            else {
                const nodeName = (e.target as HTMLElement).nodeName
                const isSvg = nodeName === "svg" || nodeName === "path" || nodeName === "g" || nodeName === "rect" || nodeName === "circle";
                if (selectMode && !isSelected && !isSvg && file.isDirectory) onClick();
                else selectedOnClick();
            }
        }} onContextMenu={(e) => {
            e.preventDefault();
            onForceSelect();
        }}>
            <AnimatePresence>
                {selectMode && <Row key={file.path} $width='auto' initial={{ x: -100 }} animate={{ x: 0 }} exit={{ x: -100 }} transition={{ duration: .2 }}>
                    {isSelected ? <CheckSquare2Icon size={24} /> : <SquareIcon size={24} onClick={selectedOnClick} />}
                </Row>}
            </AnimatePresence>
            <ItemIcon file={file} />
            <Column $gap="xs">
                <Text $width="full">{file.name}</Text>
                <Row $gap="md" $justify="start">
                    <Text $color="content-muted" $size="caption">{parseTimestampToDate(file.created)}</Text>
                    {!file.isDirectory && <Text $color="content-muted" $size="caption">{formatBytes(file.size)}</Text>}
                </Row>
            </Column>
        </Row>
    </Box>
}

export default ListItem;