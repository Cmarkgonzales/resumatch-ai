import { Link, NavLink, useNavigate } from "react-router";
import { Upload, Home, LogOut, Trash2, Menu } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePuterStore } from "../lib/puter";

const Navbar = () => {
    const { auth, fs, kv } = usePuterStore();
    const [mobileMenu, setMobileMenu] = useState(false);
    const [isUserMenuActive, setIsUserMenuActive] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isWiping, setIsWiping] = useState(false);
    const [files, setFiles] = useState<FSItem[]>([]);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const navItems = [
        { to: "/home", label: "Home", icon: <Home className="w-4 h-4" /> },
        { to: "/upload", label: "Upload", icon: <Upload className="w-4 h-4" /> },
    ];

    // Close menus with Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsUserMenuActive(false);
                setMobileMenu(false);
                setShowConfirm(false);
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuActive(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const getUserInitial = () => {
        if (!auth?.user?.username) return "U";
        return auth.user.username.charAt(0).toUpperCase();
    };

    const handleSignOut = useCallback(async () => {
        try {
            await auth.signOut();
            setIsUserMenuActive(false);
            navigate("/");
        } catch (err) {
            console.error("Sign out failed:", err);
        }
    }, [auth, navigate]);

    const handleWipe = async () => {
        setIsWiping(true);
        try {
            // Lazy load files only when wiping
            if (files.length === 0) {
                const data = (await fs.readDir("./")) as FSItem[];
                setFiles(data);
            }
            for (const file of files) {
                await fs.delete(file.path);
            }
            await kv.flush();
            setFiles([]);
            setShowConfirm(false);
        } catch (err) {
            console.error("Wipe failed:", err);
        } finally {
            setIsWiping(false);
        }
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <Link
                to="/"
                className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                aria-label="Home"
            >
                <img
                    src="/images/logo.svg"
                    alt="ResuMatch AI Logo"
                    className="w-8 h-8 rounded-full bg-bg-secondary"
                />
                <span className="text-lg md:text-xl font-bold text-gradient">
                    ResuMatch AI
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 transition">
                {navItems.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                        `flex items-center gap-1 text-lg md:text-xl font-medium rounded-full py-2 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isActive
                            ? "text-white font-semibold bg-primary"
                            : "text-text-primary hover:text-primary hover:bg-bg-secondary"
                        }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}

                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuActive((prev) => !prev)}
                        aria-haspopup="true"
                        aria-expanded={isUserMenuActive}
                        aria-controls="user-menu"
                        className={`flex items-center gap-2 rounded-full px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-bg-secondary hover:text-primary ${
                        isUserMenuActive ? "bg-bg-secondary text-primary" : "text-text-primary"
                        }`}
                    >
                        <span className="sr-only">Open user menu</span>
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {getUserInitial()}
                        </div>
                        <span className="text-sm font-medium hidden md:inline">
                        {auth?.user?.username ?? ""}
                        </span>
                    </button>

                    {isUserMenuActive && (
                        <div
                        id="user-menu"
                        className="absolute top-full right-0 mt-6 w-52 bg-white border-border rounded-lg shadow-lg py-2 z-50"
                        role="menu"
                        >
                        <button
                            onClick={() => {
                            setShowConfirm(true);
                            setIsUserMenuActive(false);
                            }}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                            role="menuitem"
                        >
                            <Trash2 className="w-4 h-4" />
                            Wipe Data
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-text-primary"
                            role="menuitem"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setMobileMenu((prev) => !prev)}
                aria-label="Menu"
                aria-expanded={mobileMenu}
                aria-controls="mobile-menu"
            >
                <Menu className="w-6 h-6" aria-hidden="true" />
            </button>

            {mobileMenu && (
                <div
                    id="mobile-menu"
                    className="absolute top-full mt-2 right-4 bg-white border-border rounded-lg shadow-md w-48 p-2 flex flex-col gap-2 md:hidden z-50"
                    role="menu"
                >
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMobileMenu(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-text-primary hover:bg-gray-100"
                                }`
                            }
                            role="menuitem"
                        >
                            {icon} {label}
                        </NavLink>
                    ))}
                    <button
                        onClick={() => {
                            setIsUserMenuActive(false);
                            setShowConfirm(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        role="menuitem"
                    >
                        <Trash2 className="w-4 h-4" /> Wipe Data
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-text-primary hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        role="menuitem"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            )}

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center text-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                >
                    <div className="w-[360px] bg-white rounded-lg shadow-lg p-6 max-w-md">
                        <Trash2 className="w-10 h-10 mx-auto mb-4 text-red-600" aria-hidden="true" />
                        <p id="confirm-title" className="text-xl font-semibold mb-4">
                            Delete all data?
                        </p>
                        <p className="text-gray-700 mb-6">
                            This action will permanently delete all stored resume and data.
                        </p>
                        <div className="flex flex-col justify-end gap-3">
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                onClick={handleWipe}
                                disabled={isWiping}
                            >
                                {isWiping ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                                className="w-full border border-border hover:bg-gray-200 text-gray-800 px-4 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                onClick={() => setShowConfirm(false)}
                                disabled={isWiping}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
