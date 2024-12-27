import React, { useEffect, useState } from 'react';
import { Box, Column, Container, Flex, Image, Row, Text } from '../components/ui/primitives';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { smooth } from '../util/motion';
import { cvt } from '../util/styler';
import useMobile from '../hooks/useMobile';
import { usePage } from '../contexts/PageContext';

const LockScreen = () => {
    const isMobile:boolean = useMobile();
    const { setPage } = usePage();
    const [onPin, setOnPin] = useState(false);
    const [pin, setPin] = useState("");
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (onPin){
            if (pin.length === 4) {
                axios.get(`/pin?q=${pin}`).then(res => {
                    if (res.data == "success") {
                        setPage("main");
                    } else {
                        navigator.vibrate(200);
                        setShake(true);
                        setTimeout(() => setShake(false), 500);
                        setPin("");
                    }
                });
            }
        }
        const keydown = (e: KeyboardEvent) => {
            if (!onPin) return setOnPin(true);
            if (shake) return;
            if ( pin.length >= 4 ) return;
            if (e.key === "Backspace") setPin(pin.slice(0, -1));
            else if (e.key.match(/[0-9]/)) setPin(pin + e.key);
        };
        window.addEventListener("keydown", keydown);
        return () => window.removeEventListener("keydown", keydown);
    }, [pin, shake, onPin]);

    return (
        <Container $center onPointerDown={() => setOnPin(true)}>
            <AnimatePresence>
                {!onPin && (
                    <Column
                        $absolute
                        key="icon"
                        initial={{ opacity: 0, y: 50, rotateX: 90, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -100, rotateX: 90, scale: 0.5 }}
                        transition={smooth}
                    >
                        <Image src="icon_light.svg" $width="20md" />
                    </Column>
                )}
                {onPin && (<>
                    <Column
                        $absolute
                        key="pin"
                        initial={{ opacity: 0, y: 100, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -100, scale: 0.5 }}
                        transition={smooth}
                    >
                        <Row $gap="4xs">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Box
                                    key={i}
                                    $border="2px content solid"
                                    $background={shake ? 'error' : pin[i] ? 'content' : 'transparent'}
                                    style={{transition: 'background 0.1s'}}
                                    $rounded="5xs"
                                    $width="5xs"
                                    $height="5xs"
                                    initial={{ borderColor: cvt('content'), x: 0 }}
                                    animate={{
                                        borderColor: cvt(shake ? 'error' : 'content'),
                                        x: shake ? [0, -5, 5, -5, 5, 0] : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            ))}
                        </Row>
                        {isMobile && <Column $gap='3xs' $mt="10xs">
                            {[
                                ["1", "2", "3"],
                                ["4", "5", "6"],
                                ["7", "8", "9"],
                                ["", "0", "<"],
                            ].map((row, i) => (
                                <Row key={i} $gap="3xs">
                                    {row.map((key, j) => (
                                        i === 3 && j === 0 ? <Box key="none" $width="16xs" $height="16xs" /> :
                                        <Box
                                            key={`${i}-${j}`}
                                            $background="#fff1"
                                            $rounded="8xs"
                                            $width="16xs"
                                            $height="16xs"
                                            onPointerDown={() => {
                                                if (shake) return;
                                                if (key === "<") setPin(pin.slice(0, -1));
                                                else if (pin.length < 4) setPin(pin + key);
                                            }}
                                        >
                                            <Container $center>
                                                <Text
                                                    $color="content"
                                                    $size="headline"
                                                    $weight="light"
                                                >
                                                    {key}
                                                </Text>
                                            </Container>
                                        </Box>
                                    ))}
                                </Row>
                            ))}
                        </Column>}
                    </Column>
                </>)}
            </AnimatePresence>
        </Container>
    );
};

export default LockScreen;
