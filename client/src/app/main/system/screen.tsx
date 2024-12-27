import React, { useEffect, useMemo, useState } from "react"
import Page from "../../../components/ui/page";
import { Column, Row, Text } from "../../../components/ui/primitives";
import useSocket from "../../../hooks/useSocket";
import Progresser from "./progresser";
import { BatteryChargingIcon } from "lucide-react";
import { cvt } from "../../../util/styler";
import { formatSeconds } from "../../../util/parser";

const SystemScreen = ({h}) => {
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

    const cpuUsage = useMemo(() => cpu["usage"] ? (+cpu["usage"]) : 0, [cpu]);

    const memoryUsage = useMemo(() => memory["usage"] ? +memory["usage"] : 0, [memory]);
    const memTotal = useMemo(() => memory.MemTotal ? (memory.MemTotal / 1024 / 1024).toFixed(2) : 0, [memory]);
    const memUsing = useMemo(() => memory.MemFree ? ((memory.MemTotal - memory.MemFree - memory.Buffers - memory.Cached) / 1024 / 1024).toFixed(2) : 0, [memory]);

    const batteryLevel = useMemo(() => battery["level"] ? +battery["level"] : 0, [battery]);
    const batteryCharging = useMemo(() => battery["AC powered"] === "true" ? true : false, [battery]);

    const rootTotal = useMemo(() => storage["root"] ? (storage["root"]["size"] / 1024 / 1024).toFixed(2) : 0, [storage]);
    const rootUsing = useMemo(() => storage["root"] ? (storage["root"]["used"] / 1024 / 1024).toFixed(2) : 0, [storage]);
    const rootCapacity = useMemo(() => storage["root"] ? storage["root"]["capacity"] : 0, [storage]);
    const storageTotal = useMemo(() => storage["storage"] ? (storage["storage"]["size"] / 1024 / 1024).toFixed(2) : 0, [storage]);
    const storageUsing = useMemo(() => storage["storage"] ? (storage["storage"]["used"] / 1024 / 1024).toFixed(2) : 0, [storage]);
    const storageCapacity = useMemo(() => storage["storage"] ? storage["storage"]["capacity"] : 0, [storage]);

    return <Page h={h}>
        <Column $padding="lg" $gap="lg" $justify="start" $height="full">
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
                <Text>Machine</Text>
                <Text $color="content-muted">{os["machine"]}</Text>
            </Row>
            <Row $width="full" $justify="between">
                <Text>Uptime</Text>
                <Text $color="content-muted">{os["uptime"] && formatSeconds(os["uptime"])}</Text>
            </Row>
            <Progresser value={cpuUsage}>CPU ( {cpuUsage.toFixed(2)}% )</Progresser>
            <Progresser value={memoryUsage}>Memory ( {memUsing}GB / {memTotal}GB )</Progresser>
            <Progresser value={batteryLevel}>
                <Row $width="full" $justify="between" $gap="sm" $relative>
                    <Text>Battery ( {batteryLevel}% )</Text>
                    {batteryCharging && <BatteryChargingIcon style={{position:"absolute", right:0, width:cvt("body * 2")}} />}
                </Row>
            </Progresser>
            <Progresser value={rootCapacity}>Storage Root ( {rootUsing}GB / {rootTotal}GB )</Progresser>
            <Progresser value={storageCapacity}>Storage SD card ( {storageUsing}GB / {storageTotal}GB )</Progresser>
        </Column>
    </Page>
}

export default SystemScreen;