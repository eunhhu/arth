import { useEffect, useState } from "react";

const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
        (window.navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i) ? true : false)
      );
    };
  handleResize();
  window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return isMobile;
}

export default useMobile;