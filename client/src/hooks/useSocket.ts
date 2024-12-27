import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const useSocket = (uri?: string) => {
    const [socket] = useState<Socket>(() => io(uri || '/'));

    useEffect(() => {
        return () => {
            socket.offAny();
            socket.removeAllListeners();
            socket.disconnect();
            socket.close();
        };
    }, [socket]);

    return socket;
};

export default useSocket;