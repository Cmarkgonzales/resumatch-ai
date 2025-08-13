import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/settings", "routes/settings.tsx"),
    route("/auth", "routes/auth.tsx"),
    route("/wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
