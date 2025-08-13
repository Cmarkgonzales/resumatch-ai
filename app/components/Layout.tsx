import Sidebar from "./Sidebar";
import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 bg-gray-50 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
