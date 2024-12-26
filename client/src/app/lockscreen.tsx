import React from 'react';
import { Column, Container, Image, Text } from '../components/ui/primitives'

const LockScreen = () => {
    return <Container $center $background='background'>
        <Column $padding='lg'>
            <Image src='icon_light.svg' $width='20md'></Image>
        </Column>
        <Column>
            <Text $align="center" $size='body' $weight='regular'>A dummy description for test this page.</Text>
        </Column>
    </Container>
}

export default LockScreen;
