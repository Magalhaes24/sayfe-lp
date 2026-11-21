import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPage } from "./tracker";

// Mounted once inside the router: starts the tracker (only if the visitor
// consented) and reports every route change as a page view.
export default function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => initAnalytics(), []);

  useEffect(() => {
    trackPage(pathname);
  }, [pathname]);

  return null;
}
