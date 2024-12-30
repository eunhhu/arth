import React, { CSSProperties, useEffect, useState } from "react"
import Page from "../../../components/ui/page"
import Sidebar from "../../../components/ui/sidebar";
import { Box, Column, Container, Input, Row, Select, Text } from "../../../components/ui/primitives";
import useMobile from "../../../hooks/useMobile";
import { FilterIcon, PlusIcon } from "lucide-react";
import axios from "axios";

const DatabaseScreen = ({h}) => {
    const isMobile = useMobile();
    const [dbs, setDbs] = useState<string[]>([]);
    const [db, setDb] = useState<string>("");
    const [dbadd, setDbadd] = useState<string>("");
    const [collections, setCollections] = useState<string[]>([]);
    const [collection, setCollection] = useState<string>("");
    const [coladd, setColadd] = useState<string>("");
    const [documents, setDocuments] = useState<Record<string, any>[]>([]);
    const [filterkey, setFilterkey] = useState<string>("");
    const [filtervalue, setFiltervalue] = useState<string>("");
    const [filterop, setFilterop] = useState<string>("eq");
    const [tavalue, setTavalue] = useState<string>("");
    const [onadd, setOnadd] = useState<boolean>(false);
    const [onedit, setOnedit] = useState<boolean>(false);
    const buttonProps:CSSProperties = { cursor: isMobile ? "default" : "pointer", userSelect: "none"};

    const fetchDbs = async () => {
        axios.get("/api/db/dbs").then((res) => {
            setDbs(res.data);
        }).catch((e) => {
            console.error(e);
        })
    }

    const fetchCollections = async () => {
        if (!db) return;
        axios.get("/api/db/cols", { params: { db }}).then((res) => {
            setCollections(res.data);
        }).catch((e) => {
            console.error(e);
        })
    }

    const fetchDocuments = async () => {
        if (!db || !collection) return;
        axios.get("/api/db/docs", { params: { db, col: collection }}).then((res) => {
            setDocuments(res.data);
        }).catch((e) => {
            console.error(e);
        })
    }

    useEffect(() => {
        fetchDbs();
        fetchCollections();
    }, [])

    useEffect(() => {
        setCollection("");
        setCollections([]);
        if (db) fetchCollections();
    }, [db])

    useEffect(() => {
        if(collection) fetchDocuments();
    }, [collection])

    return <Page h={h}>
        <Row $height={h} $justify="between" $gap="md">
        <Sidebar width='36xs'>
            <Column $gap="sm" $padding="md">
                <Row>
                    <Input placeholder="Database Name" $width="full" $bb="1px outline solid" $padding="xs" value={dbadd} onChange={e => setDbadd(e.target.value)} />
                    <PlusIcon size={24} style={buttonProps}  onClick={() => {
                        axios.put("/api/db/db", { name: dbadd }).then((res) => {
                            fetchDbs();
                            setDbadd("");
                        }).catch((e) => {
                            console.error(e);
                        })
                    }}/>
                </Row>
            </Column>
            {dbs.length > 0 && <>
            <Select
                value={db} onChange={(e) => setDb(e.target.value)}
                $background='surface' $border='1px outline solid' $padding='sm' $rounded='xs' $color='content' $width='full'
            >
                {dbs.map((db) => <option key={db} value={db}>{db}</option>)}
            </Select>
            <Column $justify="start" $padding="sm" $gap="sm" $height="full" style={{ overflowY: "auto", maxHeight: "90%" }} className="draggable">
                {collections.map((col) => <Box key={col} $rounded="sm" $padding="sm" $width="full" $background={col === collection ? "background" : ""} onClick={() => setCollection(col)}>
                    <Text>{col}</Text>
                </Box>)}
                <Box $rounded="sm" $padding="sm" $width="full">
                    <Row>
                        <Input $width="full" placeholder="New Collection" value={coladd} onChange={(e) => setColadd(e.target.value)} $bb="1px outline solid" $padding="xs" />
                        <PlusIcon size={24} style={buttonProps} onClick={() => {
                            if (!coladd.trim()) return;
                            axios.put("/api/db/col", { db, name: coladd }).then((res) => {
                                fetchCollections();
                                setColadd("");
                            }).catch((e) => {
                                console.error(e);
                            })
                            setColadd("");
                        }} />
                    </Row>
                </Box>
            </Column>
            </>}
        </Sidebar>
        <Column $height="full">
            <Row $justify="between" $gap="sm" $color="content" $padding="sm">
                <FilterIcon width={24} height={18} style={{minWidth:"24px"}} />
                <Input placeholder="Key" $width="full" $bb="1px outline solid" $padding="xs" value={filterkey} onChange={e => setFilterkey(e.target.value)} />
                <Input placeholder="Value" $width="full" $bb="1px outline solid" $padding="xs" value={filtervalue} onChange={e => setFiltervalue(e.target.value)} />
                <Select $width="full" $background="surface" $border="1px outline solid" $padding="xs" $rounded="xs" value={filterop} onChange={(e) => setFilterop(e.target.value)}>
                    <option value="eq">=</option>
                    <option value="ne">!=</option>
                    <option value="gt">{">"}</option>
                    <option value="lt">{"<"}</option>
                    <option value="gte">{">="}</option>
                    <option value="lte">{"<="}</option>
                </Select>
            </Row>
            <Container $scroll $padding="sm" $gap="sm">
                {documents.length > 0 ? documents.filter(doc => {
                    if (!filterkey || !filtervalue) return true;
                    switch(filterop) {
                        case "eq": return doc[filterkey] === filtervalue;
                        case "ne": return doc[filterkey] !== filtervalue;
                        case "gt": return doc[filterkey] > filtervalue;
                        case "lt": return doc[filterkey] < filtervalue;
                        case "gte": return doc[filterkey] >= filtervalue;
                        case "lte": return doc[filterkey] <= filtervalue;
                        default: return true;
                    }
                }).map((doc) => 
                <Box key={doc._id} $rounded="sm" $padding="sm" $background="surface" $margin="sm" style={buttonProps}>
                    <Text>{doc._id}</Text>
                </Box>): <Text $width="full" $align="center">No documents found</Text>}
            </Container>
        </Column>
        </Row>
    </Page>
}

export default DatabaseScreen;