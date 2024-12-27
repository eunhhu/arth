import { useRef } from "react";

const useOnce = (callback: () => void) => {
    const hasBeenCalled = useRef(false);
    if (!hasBeenCalled.current) {
        hasBeenCalled.current = true;
        callback();
    }
}

export default useOnce;