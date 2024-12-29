import React, { CSSProperties, useEffect, useState } from "react"
import Page from "../../../components/ui/page"
import useSocket from "../../../hooks/useSocket";
import { Box, Button, Column, Container, Input, Row, Text } from "../../../components/ui/primitives";
import { ArrowRightLeftIcon, ChevronUpIcon, CopyIcon, DownloadIcon, FileIcon, FolderIcon, FolderPenIcon, GridIcon, HouseIcon, ListIcon, MousePointer2Icon, PlusIcon, SearchIcon, SortDescIcon, SquareDashedIcon, SquareDashedMousePointerIcon, Trash2Icon, UploadIcon } from "lucide-react";
import useMobile from "../../../hooks/useMobile";
import ListItem from "./listItem";
import axios from "axios";
import OverlayAction from "./overlayAction";
import { AnimatePresence } from "framer-motion";
import { useAlert } from "../../../contexts/AlertContext";


const CloudScreen = ({h}) => {
    const socket = useSocket('/cloud');
    const isMobile = useMobile();
    const { alerts, setAlerts, surfaceAlerts, setSurfaceAlerts } = useAlert();
    const [list, setList] = useState<FileInfo[]>([]);
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [sort, setSort] = useState<'name' | 'date' | 'size'>('name');
    const [search, setSearch] = useState<string>('');
    const [route, setRoute] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [onCreate, setOnCreate] = useState<boolean>(false);
    const [onRename, setOnRename] = useState<boolean>(false);
    
    const buttonProps:CSSProperties = { cursor: isMobile ? "default" : "pointer", userSelect: "none"}

    const uploadAlert = (data: AlertMessage) => {
        setAlerts(prev => [...prev, data]);
        setSurfaceAlerts(prev => [...prev, data.id]);
    }

    const modifyUploadProgress = (id: string, progress: number, message?: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? {...a, progress, message} : a));
    }

    useEffect(() => {
        socket.on("list", (files: FileInfo[]) => {
            setList(files);
        });
        socket.on("fileCreated", (file: FileInfo) => {
            setList(prev => [...prev, file]);
        });
        socket.on("folderRenamed", (path: string[], name: string) => {
            setRoute(route => route.map((r, i) => i === path.length - 1 ? name : r));
        });
        socket.on("folderRemoved", (routeTo: string[]) => {
            setRoute(routeTo);
        });
    }, [socket])

    useEffect(() => {
        socket.emit("route", route);
    }, [socket, route])

    useEffect(() => {
        if(!selectMode) setSelected([]);
    }, [selectMode])

    const handleOffSelectMode = () => {
        setName('');
        setOnCreate(false);
        setOnRename(false);
        setSelectMode(false);
    }

    const handleUp = () => {
        if(route.length > 0) setRoute(route.slice(0, -1));
    }

    const handleHome = () => {
        setRoute([]);
    }

    const handleMove = () => {
        if(selected.length === 0) return;
        else if(selected.length === 1) return axios.get("/api/cloud/move", {params: {path: selected[0], to: "/"+route.join("/")}}).then(handleOffSelectMode);
        else axios.post("/api/cloud/moveMany", {paths: selected}, {params: {to: "/"+route.join("/")}}).then(handleOffSelectMode);
    }

    const handleCopy = () => {
        if(selected.length === 0) return;
        else if(selected.length === 1) return axios.get("/api/cloud/copy", {params: {path: selected[0], to: "/"+route.join("/")}}).then(handleOffSelectMode);
        else axios.post("/api/cloud/copyMany", {paths: selected}, {params: {to: "/"+route.join("/")}}).then(handleOffSelectMode);
    }

    const handleRename = () => {
        setName(selected.length === 1 ? selected[0].replaceAll("\\", "/").split("/").pop() || "" : "");
        setOnRename(true);
    }

    const handleDownload = () => {
        if(selected.length === 0) return;
        selected.forEach(path => {
            axios.get("/api/cloud/download", {params: {path}, responseType: "blob"}).then(res => {
                const url = URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", path.split("/").pop() || "file");
                document.body.appendChild(link);
                link.click();
                link.remove();
                setSelectMode(false);
            });
        });
    }

    const handleDelete = () => {
        if(selected.length === 0) return;
        else if(selected.length === 1) return axios.get("/api/cloud/delete", {params: {path: selected[0]}}).then(handleOffSelectMode);
        else axios.post("/api/cloud/deleteMany", {paths: selected}).then(handleOffSelectMode);
    }

    const handleUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = () => {
            const files = input.files;
            if(files.length > 0) {
                const formData = new FormData();
                for(let i = 0; i < files.length; i++) {
                    formData.append("file", files[i]);
                }
                const uid = Math.random().toString(36).substring(7);
                uploadAlert({id: uid, from: "cloud", message: "Uploading files...", progress: 0});
                axios.post("/api/cloud/upload", formData,{
                    params: {path: "/"+route.join("/")},
                    headers: { 'Content-Type': 'multipart/form-data'},
                    onUploadProgress: (progressEvent) => {
                        modifyUploadProgress(uid, progressEvent.loaded / progressEvent.total, "Uploading files...");
                    }
                }).then(() => {
                    modifyUploadProgress(uid, 1, "Upload complete");
                    handleOffSelectMode();
                });
            }
        }
        input.click();
    }

    const handleCreate = () => {
        setName('');
        setOnCreate(true);
    }

    return <Page h={h}>
        <Column $padding="sm" $gap="sm">
            <Row $justify="between" $gap="md" $color="content">
                <Column $gap="xs" $items="start" $width="48%" style={{maxWidth:"48%"}}>
                    <Row $justify="start" $gap="xs" $width="full" style={{ maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <AnimatePresence>
                            <Text $size="caption" style={buttonProps} onClick={() => setRoute([])}>/</Text>
                            {route.map((r, i) => <Text key={i} $size="caption" style={buttonProps}
                                onClick={() => setRoute(route.slice(0, i + 1))}
                                initial={{ y: -20, opacity:0 }} animate={{ y: 0, opacity:1 }} exit={{ y: -20, opacity:0 }} transition={{ duration: .2 }}
                            >{r}/</Text>)}
                        </AnimatePresence>
                    </Row>
                    <Row $justify="start" $gap="sm" $color="content-muted">
                        {!selectMode ? <>
                            <FolderIcon size={16} />
                            <Text $color="content-muted" $size="caption">{list.filter(f => f.isDirectory).length}</Text>
                            <FileIcon size={16} />
                            <Text $color="content-muted" $size="caption">{list.filter(f => !f.isDirectory).length}</Text>
                        </> : <>
                            <SquareDashedIcon size={16} />
                            <Text $color="content-muted" $size="caption">{selected.length}</Text>
                        </>}
                    </Row>
                </Column>
                <Row $width="auto" $gap="sm" onClick={() => setSort(sort === 'name' ? 'date' : sort === 'date' ? 'size' : 'name')} style={buttonProps}>
                    <SortDescIcon size={18} />
                    <Text $size="caption">{sort.toUpperCase()}</Text>
                </Row>
                <Row $width="auto" $gap="sm" onClick={() => setView(view === 'list' ? 'grid' : 'list')} style={buttonProps}>
                    {view === 'list' ? <ListIcon size={18} /> : <GridIcon size={18} />}
                    <Text $size="caption">{view.toUpperCase()}</Text>
                </Row>
                <Row $width="auto" style={buttonProps} onClick={() => setSelectMode(!selectMode)}>
                    {selectMode ? <SquareDashedMousePointerIcon size={20} /> : <MousePointer2Icon size={20} />}
                </Row>
            </Row>
            <Row $gap="sm" $width="full">
                <Input $width="full" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} $background="surface" $border="1px outline solid" $rounded="xs" $padding="xs" />
                {/* <Button $background="surface" $border="1px outline solid" $rounded="xs" $padding="xs"><SearchIcon width={32} height={16} /></Button> */}
            </Row>
        </Column>
        <Container $scroll $wrap={view === "grid"}>
            {list.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                if(sort === 'name') return a.name.localeCompare(b.name);
                if(sort === 'date') return b.created - a.created;
                if(sort === 'size') return b.size - a.size;
                return 0;
            }).filter(file => file.name.toLowerCase().includes(search.toLowerCase())).map(file => {
                const handleSelect = () => {
                    if(selected.includes(file.path)) setSelected(selected.filter(s => s !== file.path));
                    else setSelected([...selected, file.path]);
                }
                return view === 'list' ?
                <ListItem key={file.name} file={file} selected={selected} selectMode={selectMode}
                    onClick={() => {
                        if(file.isDirectory) {
                            setRoute([...route, file.name]);
                        }
                    }} selectedOnClick={handleSelect} onForceSelect={() => {
                        if(!selectMode) setSelectMode(true);
                        handleSelect();
                    }}/> :
                null;
            })}
        </Container>
        <Box $bt="1px outline solid" $width="full">
            <Row>
                <Row onClick={handleUp} $padding="md 0" $width="full" style={buttonProps}><ChevronUpIcon size={16}/></Row>
                <Row onClick={handleHome} $padding="md 0" $width="full" style={buttonProps}><HouseIcon size={16}/></Row>
                <Row onClick={handleMove} $padding="md 0" $width="full" $color={selected.length === 0 ? 'content-light' : 'content'} style={buttonProps}><ArrowRightLeftIcon size={16}/></Row>
                <Row onClick={handleCopy} $padding="md 0" $width="full" $color={selected.length === 0 ? 'content-light' : 'content'} style={buttonProps}><CopyIcon size={16}/></Row>
                <Row onClick={handleRename} $padding="md 0" $width="full" $color={selected.length === 0 ? 'content-light' : 'content'} style={buttonProps}><FolderPenIcon size={16}/></Row>
                <Row onClick={handleDownload} $padding="md 0" $width="full" $color={selected.length === 0 ? 'content-light' : 'content'} style={buttonProps}><DownloadIcon size={16}/></Row>
                <Row onClick={handleDelete} $padding="md 0" $width="full" $color={selected.length === 0 ? 'content-light' : 'content'} style={buttonProps}><Trash2Icon size={16}/></Row>
                <Row onClick={handleUpload} $padding="md 0" $width="full" style={buttonProps}><UploadIcon size={16}/></Row>
                <Row onClick={handleCreate} $padding="md 0" $width="full" style={buttonProps}><PlusIcon size={16}/></Row>
            </Row>
        </Box>
        <AnimatePresence>
            {onCreate && <OverlayAction key="create" value={name} onChange={setName} onCancel={() => setOnCreate(false)} actions={[
                ["File", () => name.trim() && axios.get("/api/cloud/createFile", {params: {path: "/"+route.join("/"), name}}).then(handleOffSelectMode)],
                ["Folder", () => name.trim() && axios.get("/api/cloud/createDir", {params: {path: "/"+route.join("/"), name}}).then(handleOffSelectMode)]
            ]} />}
            {onRename && <OverlayAction key="rename" value={name} onChange={setName} onCancel={() => setOnRename(false)} actions={[
                ["Rename", () => {
                    if(name.trim() === "") return;
                    else if(selected.length === 0) return handleOffSelectMode();
                    else if(selected.length === 1) return axios.get("/api/cloud/rename", {params: {path: selected[0], name}}).then(handleOffSelectMode);
                    else axios.post("/api/cloud/renameMany", {paths: selected}, {params: {name}}).then(handleOffSelectMode);
                }]
            ]} />}
        </AnimatePresence>
    </Page>
}


export default CloudScreen;