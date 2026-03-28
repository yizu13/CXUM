import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // SimpleBar usa su propio contenedor de scroll, no el window
    const simpleBarContent = document.querySelector(".simplebar-content-wrapper");
    if (simpleBarContent) {
      simpleBarContent.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
