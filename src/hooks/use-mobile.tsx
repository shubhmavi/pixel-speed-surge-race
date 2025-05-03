
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Check for touch devices and mobile browsers
  const isTouchDevice = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    
    // Check for touch capability
    const hasTouchCapability = 'ontouchstart' in window || 
      (window.navigator && window.navigator.maxTouchPoints > 0) ||
      ('msMaxTouchPoints' in window.navigator && window.navigator.msMaxTouchPoints > 0);
    
    // Check for mobile user agent
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return hasTouchCapability || isMobileUA;
  }, [])

  return isMobile || isTouchDevice
}
