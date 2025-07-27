import type { Route } from "./+types/home";
export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div className="flex justify-center p-8">
            <h1 className="text-3xl font-bold text-primary">Welcome to ResuMatch AI</h1>
        </div>
    )
}
