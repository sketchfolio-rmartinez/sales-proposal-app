import { useEffect, useState } from "react";

export type AppRoute = "builder" | "blurbs";

function routeFromPath(pathname: string): AppRoute {
  return pathname === "/admin/blurbs" ? "blurbs" : "builder";
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(routeFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    const nextPath = nextRoute === "blurbs" ? "/admin/blurbs" : "/";
    window.history.pushState({}, "", nextPath);
    setRoute(nextRoute);
  };

  return { route, navigate };
}
