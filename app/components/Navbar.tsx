import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
    AlertTriangle,
    ChevronDown,
    Database,
    LayoutDashboard,
    LoaderCircle,
    LogOut,
    Menu,
    ShieldCheck,
    Trash2,
    Upload,
    X,
    type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePuterStore } from "../lib/puter";

const navItems = [
    { to: "/home", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Analyze", icon: Upload },
];

const getPageLabel = (pathname: string) => {
    if (pathname.startsWith("/upload")) return "Analyze Resume";
    if (pathname.startsWith("/resume")) return "Resume Feedback";
    return "Dashboard";
};

const Navbar = () => {
    const { auth, fs, kv } = usePuterStore();
    const [mobileMenu, setMobileMenu] = useState(false);
    const [isUserMenuActive, setIsUserMenuActive] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isWiping, setIsWiping] = useState(false);
    const [wipeError, setWipeError] = useState<string | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const pageLabel = getPageLabel(location.pathname);

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
            setMobileMenu(false);
            navigate("/");
        } catch (err) {
            console.error("Sign out failed:", err);
        }
    }, [auth, navigate]);

    const handleWipe = async () => {
        setIsWiping(true);
        setWipeError(null);
        try {
            const filesToDelete = ((await fs.readDir("./")) as FSItem[]) || [];

            for (const file of filesToDelete) {
                await fs.delete(file.path);
            }

            await kv.flush();
            setShowConfirm(false);
            setMobileMenu(false);

            if (location.pathname === "/home") {
                navigate(0);
            } else {
                navigate("/home");
            }
        } catch (err) {
            console.error("Wipe failed:", err);
            setWipeError(err instanceof Error ? err.message : "Failed to wipe workspace data.");
        } finally {
            setIsWiping(false);
        }
    };

    const openWipeConfirm = () => {
        setWipeError(null);
        setShowConfirm(true);
        setIsUserMenuActive(false);
        setMobileMenu(false);
    };

    const closeWipeConfirm = () => {
        if (isWiping) return;
        setWipeError(null);
        setShowConfirm(false);
    };

    const renderNavLink = (to: string, label: string, Icon: LucideIcon) => (
        <NavLink
            key={to}
            to={to}
            onClick={() => setMobileMenu(false)}
            className={({ isActive }) =>
                `group relative flex min-h-11 items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-bg-secondary hover:text-primary"
                }`
            }
        >
            {() => (
                <>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{label}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <>
            <nav
                className="sticky top-4 z-40 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[8px] border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-indigo-100/60 backdrop-blur"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <Link
                        to="/home"
                        className="flex min-h-11 shrink-0 items-center gap-3 rounded-[8px] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label="ResuMatch AI dashboard"
                    >
                        <img
                            src="/images/logo.svg"
                            alt="ResuMatch AI Logo"
                            className="h-11 w-11 rounded-[8px] bg-bg-secondary shadow-sm ring-1 ring-indigo-100"
                        />
                        <span className="hidden text-xl font-black text-gradient sm:inline">
                            ResuMatch AI
                        </span>
                    </Link>

                </div>

                <div className="hidden items-center gap-2 md:flex">
                    {navItems.map(({ to, label, icon }) => renderNavLink(to, label, icon))}
                </div>

                <div className="hidden items-center gap-3 md:flex" ref={userMenuRef}>
                    <div className="hidden items-center gap-2 rounded-[8px] bg-bg-secondary px-3 py-2 text-xs font-semibold text-primary lg:flex">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Secure workspace
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuActive((prev) => !prev)}
                            aria-haspopup="true"
                            aria-expanded={isUserMenuActive}
                            aria-controls="user-menu"
                            className="flex min-h-11 items-center gap-2 rounded-[8px] px-2 py-1 text-left transition hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <span className="sr-only">Open user menu</span>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                {getUserInitial()}
                            </span>
                            <span className="hidden max-w-32 truncate text-sm font-semibold text-text-primary lg:inline">
                                {auth?.user?.username ?? "User"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                        </button>

                        {isUserMenuActive && (
                            <div
                                id="user-menu"
                                className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-[8px] border border-indigo-100 bg-white shadow-xl shadow-indigo-100/70"
                                role="menu"
                            >
                                <div className="border-b border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-primary text-sm font-black text-white shadow-lg shadow-indigo-100">
                                            {getUserInitial()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-black text-slate-950">
                                                {auth?.user?.username ?? "ResuMatch user"}
                                            </p>
                                            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                                                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                                Secure Puter workspace
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-1 p-2">
                                    <p className="px-3 py-2 text-xs font-bold uppercase text-text-secondary">
                                        Account
                                    </p>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-sm font-semibold text-text-primary transition hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        role="menuitem"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-bg-secondary text-primary">
                                            <LogOut className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span>
                                            <span className="block">Sign out</span>
                                            <span className="block text-xs font-medium text-text-secondary">
                                                Leave this workspace
                                            </span>
                                        </span>
                                    </button>
                                    <div className="my-1 border-t border-border" />
                                    <button
                                        onClick={openWipeConfirm}
                                        className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                        role="menuitem"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-red-50 text-red-600">
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span>
                                            <span className="block">Wipe workspace data</span>
                                            <span className="block text-xs font-medium text-red-500">
                                                Delete resumes and feedback
                                            </span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-[8px] hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
                    onClick={() => setMobileMenu((prev) => !prev)}
                    aria-label="Open navigation menu"
                    aria-expanded={mobileMenu}
                    aria-controls="mobile-menu"
                >
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
            </nav>

            {mobileMenu && (
                <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
                    <button
                        className="absolute inset-0 bg-slate-950/40"
                        aria-label="Close navigation menu"
                        onClick={() => setMobileMenu(false)}
                    />
                    <aside
                        id="mobile-menu"
                        className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-white p-5 shadow-2xl"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo.svg"
                                    alt="ResuMatch AI Logo"
                                    className="h-10 w-10 rounded-[8px] bg-bg-secondary"
                                />
                                <div>
                                    <p className="font-black text-gradient">ResuMatch AI</p>
                                    <p className="text-xs text-text-secondary">{pageLabel}</p>
                                </div>
                            </div>
                            <button
                                className="flex min-h-11 min-w-11 items-center justify-center rounded-[8px] hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                onClick={() => setMobileMenu(false)}
                                aria-label="Close navigation menu"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {navItems.map(({ to, label, icon }) => renderNavLink(to, label, icon))}
                        </div>

                        <div className="mt-auto border-t border-border pt-4">
                            <div className="mb-4 flex items-center gap-3 rounded-[8px] bg-bg-secondary p-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                    {getUserInitial()}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-text-primary">
                                        {auth?.user?.username ?? "User"}
                                    </p>
                                    <p className="text-xs text-text-secondary">Signed in</p>
                                </div>
                            </div>
                            <button
                                onClick={openWipeConfirm}
                                className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Wipe Data
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-semibold text-text-primary hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {showConfirm && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                >
                    <div className="w-full max-w-md overflow-hidden rounded-[8px] border border-red-100 bg-white text-left shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-red-100 bg-red-50 p-5">
                            <div className="flex gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-red-600 shadow-sm">
                                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div>
                                    <p id="confirm-title" className="text-xl font-black text-slate-950">
                                        Wipe workspace data?
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-red-700">
                                        This permanently removes stored analyses from this app.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="flex min-h-9 min-w-9 items-center justify-center rounded-[8px] text-red-700 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                                onClick={closeWipeConfirm}
                                disabled={isWiping}
                                aria-label="Close confirmation"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="rounded-[8px] border border-border bg-slate-50 p-4">
                                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                                    <Database className="h-4 w-4 text-primary" aria-hidden="true" />
                                    Data that will be deleted
                                </p>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    <li>Stored resume PDFs and preview images</li>
                                    <li>Saved company, role, and job description data</li>
                                    <li>Generated scores and feedback records</li>
                                </ul>
                            </div>

                            {wipeError && (
                                <div className="mt-4 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {wipeError}
                                </div>
                            )}

                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    className="min-h-11 rounded-[8px] border border-border px-4 py-2 font-semibold text-text-primary hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                                    onClick={closeWipeConfirm}
                                    disabled={isWiping}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={handleWipe}
                                    disabled={isWiping}
                                >
                                    {isWiping && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    )}
                                    {isWiping ? "Wiping data..." : "Wipe data"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
