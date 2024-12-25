import React from 'react';
import { Container, Text } from '../components/ui/primitives'

const ErrorScreen = () => { 
    return <Container $center>
        <Text $size='headline' $weight='strong'>Oops! Something went wrong!</Text>
    </Container>
}

export default ErrorScreen;