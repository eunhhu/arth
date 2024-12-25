import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const useSocket = (uri?: string) => {
    const [socket, setSocket] = useState<Socket>(io(uri));
    const uriRef = useRef(uri);
    
    useEffect(() => {
        const newSocket = io(uriRef.current);
    
        setSocket(newSocket);
    
        return () => {
            newSocket.removeAllListeners();
            newSocket.disconnect();
            newSocket.close();
        };
    }, [uri]);
    
    return socket;
};

export default useSocket;