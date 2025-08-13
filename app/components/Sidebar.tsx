import { useState } from "react";
import { NavLink } from "react-router";
import { House, Upload, Settings, Menu, X } from "lucide-react";
import { usePuterStore } from "../lib/puter";

export default function Sidebar() {
    const { auth } = usePuterStore();
    const [isOpen, setIsOpen] = useState(false);

    const getUserInitial = () => {
        if (!auth?.user?.username) return "U";
        return auth.user.username.charAt(0).toUpperCase();
    };

    const navLinks = [
        { to: "/", label: "Home", icon: <House size={18} /> },
        { to: "/upload", label: "Upload", icon: <Upload size={18} /> },
        { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
    ];

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <aside
                className={`fixed flex flex-col lg:static top-0 left-0 min-h-screen w-64 bg-white border-border border-r shadow-sm transform transition-transform duration-300 ease-in-out z-40
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="flex items-center gap-2 p-4 border-border border-b">
                    <img src="/images/logo.svg" alt="Logo" className="w-8 h-8" />
                    <span className="font-bold text-lg">ResuMatch AI</span>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)} // Close on mobile link click
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 ${
                            isActive ? "bg-gray-200 font-semibold" : ""
                            }`
                        }
                        >
                        {link.icon} {link.label}
                        </NavLink>
                    ))}
                    </nav>
                    <div className="p-4 border-border border-t flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {getUserInitial()}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">{auth?.user?.username ?? ""}</p>
                    </div>
                </div>
            </aside>
            {isOpen && (
                <div
                className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
