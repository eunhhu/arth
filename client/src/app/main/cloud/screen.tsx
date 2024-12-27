import React, { CSSProperties, useEffect, useState } from "react"
import Page from "../../../components/ui/page"
import useSocket from "../../../hooks/useSocket";
import { Box, Button, Column, Container, Flex, Input, Row, Select, Text } from "../../../components/ui/primitives";
import { FilterIcon, GridIcon, ListIcon, MoveIcon, SearchIcon, SortDescIcon } from "lucide-react";
import useMobile from "../../../hooks/useMobile";

const CloudScreen = ({h}) => {
    const socket = useSocket('/cloud');
    const isMobile = useMobile();
    const [list, setList] = useState<FileInfo[]>([]);
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [sort, setSort] = useState<'name' | 'date' | 'size'>('name');
    const [search, setSearch] = useState('');

    const buttonProps:CSSProperties = { cursor: isMobile ? "none" : "pointer", userSelect: "none"}

    useEffect(() => {
        socket.on("list", (files: FileInfo[]) => {
            setList(files);
        });
    }, [socket])

    return <Page h={h}>
        <Column $padding="sm" $gap="sm">
            <Row $justify="between" $gap="md">
                <Row $gap="sm" $relative onClick={() => setSort(sort === 'name' ? 'date' : sort === 'date' ? 'size' : 'name')} style={buttonProps}>
                    <SortDescIcon size={24} />
                    <Text $size="body">{sort.toUpperCase()}</Text>
                </Row>
                <Row $gap="sm" onClick={() => setView(view === 'list' ? 'grid' : 'list')} style={buttonProps}>
                    {view === 'list' ? <ListIcon size={24} /> : <GridIcon size={24} />}
                    <Text $size="body">View</Text>
                </Row>
            </Row>
            <Row $gap="sm" $width="full">
                <Input $width="full" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} $background="surface" $border="1px outline solid" $rounded="xs" $padding="xs" />
                <Button $background="surface" $border="1px outline solid" $rounded="xs" $padding="xs"><SearchIcon width={32} height={16} /></Button>
            </Row>
        </Column>
        <Container $scroll>
            {list.map(file => <Box key={file.name} $padding="sm" $background="surface" $border="1px outline solid" $rounded="sm">
                <Row $gap="sm">
                    <Text $size="body">{file.name}</Text>
                    <Text $size="body">{file.size}</Text>
                </Row>
            </Box>)}
        </Container>
        <Box $bt="1px outline solid" $width="full">
            <Row>
                <Row $padding="md 0" $width="full" style={buttonProps}><MoveIcon size={24}/></Row>
                <Row $padding="md 0" $width="full" style={buttonProps}><MoveIcon size={24}/></Row>
                <Row $padding="md 0" $width="full" style={buttonProps}><MoveIcon size={24}/></Row>
            </Row>
        </Box>
    </Page>
}

export default CloudScreen;