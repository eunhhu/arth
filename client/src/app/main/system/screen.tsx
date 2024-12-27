import React, { useEffect, useState } from "react"
import Page from "../../../components/ui/page";
import { Column, Row, Text } from "../../../components/ui/primitives";
import useSocket from "../../../hooks/useSocket";
import Progresser from "./progresser";

const SystemScreen = () => {
    const socket = useSocket('/sys');
    const [os, setOS] = useState<Record<string, any>>({});
    const [cpu, setCPU] = useState<Record<string, any>>({});
    const [memory, setMemory] = useState<Record<string, any>>({});
    const [battery, setBattery] = useState<Record<string, any>>({});
    const [storage, setStorage] = useState<Record<string, any>>({});

    useEffect(() => {
        socket.on("update-info", (data: Record<string, any>) => {
            setOS(data.os)
            setCPU(data.cpu)
            setMemory(data.memory)
            setBattery(data.battery)
            setStorage(data.storage)
        });
    }, [socket])

    const cpuUsage = cpu["usage"] ? +cpu["usage"] : 0;

    const memoryUsage = memory["usage"] ? +memory["usage"] : 0;
    const memTotal = memory.MemTotal ? (memory.MemTotal / 1024 / 1024).toFixed(2) : 0;
    const memUsing = memory.MemFree ? ((memory.MemFree - memory.Buffers - memory.Cached) / 1024 / 1024).toFixed(2) : 0;

    const batteryLevel = battery["level"] ? +battery["level"] : 0;

    const rootTotal = storage["root"] ? (storage["root"]["size"] / 1024 / 1024).toFixed(2) : 0;
    const rootUsing = storage["root"] ? (storage["root"]["used"] / 1024 / 1024).toFixed(2) : 0;
    const rootCapacity = storage["root"] ? storage["root"]["capacity"] : 0;
    const storageTotal = storage["storage"] ? (storage["storage"]["size"] / 1024 / 1024).toFixed(2) : 0;
    const storageUsing = storage["storage"] ? (storage["storage"]["used"] / 1024 / 1024).toFixed(2) : 0;
    const storageCapacity = storage["storage"] ? storage["storage"]["capacity"] : 0;

    return <Page>
        <Column $padding="lg" $gap="lg">
            <Row $width="full" $justify="between">
                <Text>Hostname</Text>
                <Text $color="content-muted">{os["hostname"]}</Text>
            </Row>
            <Row $width="full" $justify="between">
                <Text>Platform</Text>
                <Text $color="content-muted">{os["platform"]}</Text>
            </Row>
            <Row $width="full" $justify="between">
                <Text>Type</Text>
                <Text $color="content-muted">{os["type"]}</Text>
            </Row>
            <Row $width="full" $justify="between">
                <Text>Arch</Text>
                <Text $color="content-muted">{os["arch"]}</Text>
            </Row>
            <Row $width="full" $justify="between">
                <Text>Uptime</Text>
                <Text $color="content-muted">{os["uptime"]}s</Text>
            </Row>
            <Progresser value={cpuUsage}>CPU ( {cpuUsage}% )</Progresser>
            <Progresser value={memoryUsage}>Memory ( {memUsing}GB / {memTotal}GB )</Progresser>
            <Progresser value={batteryLevel}>Battery ( {batteryLevel}% )</Progresser>
            <Progresser value={rootCapacity}>Storage Root ( {rootUsing}GB / {rootTotal}GB )</Progresser>
            <Progresser value={storageCapacity}>Storage SD card ( {storageUsing}GB / {storageTotal}GB )</Progresser>
        </Column>
    </Page>
}

export default SystemScreen;