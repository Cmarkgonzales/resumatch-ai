import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/auth.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/home", "routes/home.tsx"),
] satisfies RouteConfig;
