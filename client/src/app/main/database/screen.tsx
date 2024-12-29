import React, { CSSProperties, useState } from "react"
import Page from "../../../components/ui/page"
import Sidebar from "../../../components/ui/sidebar";
import { Box, Column, Container, Input, Row, Select, Text } from "../../../components/ui/primitives";
import useMobile from "../../../hooks/useMobile";
import { PlusIcon } from "lucide-react";

const DatabaseScreen = ({h}) => {
    const isMobile = useMobile();
    const [dbs, setDbs] = useState<string[]>([]);
    const [db, setDb] = useState<string>("");
    const [collections, setCollections] = useState<string[]>([]);
    const [collection, setCollection] = useState<string>("");
    const [coladd, setColadd] = useState<string>("");
    const [documents, setDocuments] = useState<string[]>([]);
    const buttonProps:CSSProperties = { cursor: isMobile ? "default" : "pointer", userSelect: "none"};
    return <Page h={h}>
        <Row $height='full' $justify="between" $gap="md">
        <Sidebar width='36xs'>
            <Select
                value={db} onChange={(e) => setDb(e.target.value)}
                $background='surface' $border='1px outline solid' $padding='sm' $rounded='xs' $color='content' $width='full'
            >
                {dbs.map((db) => <option key={db} value={db}>{db}</option>)}
            </Select>
            <Column $justify="start" $padding="sm" $gap="sm" $height="full" style={{ overflowY: "auto", maxHeight: "90%" }}>
                {collections.map((col) => <Box key={col} $rounded="sm" $padding="sm" $width="full" $background={col === collection ? "background" : ""} onClick={() => setCollection(col)}>
                    <Text>{col}</Text>
                </Box>)}
                <Box $rounded="sm" $padding="sm" $width="full">
                    <Row>
                        <Input $width="full" placeholder="New Collection" value={coladd} onChange={(e) => setColadd(e.target.value)} $bb="1px outline solid" $padding="xs" />
                        <PlusIcon size={24} style={buttonProps} onClick={() => {
                            if (!coladd.trim()) return;
                            setCollections([...collections, coladd]);
                            setColadd("");
                        }} />
                    </Row>
                </Box>
            </Column>
        </Sidebar>
        <Column></Column>
        </Row>
    </Page>
}

export default DatabaseScreen;