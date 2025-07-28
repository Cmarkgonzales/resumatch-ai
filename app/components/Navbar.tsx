import { Link, NavLink, useLocation } from "react-router";
import { Upload } from "lucide-react";

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link
                to="/"
                className="flex items-center transition-all duration-300 hover:scale-[1.03] hover:opacity-90"
                aria-label="Home"
            >
                <img
                    src="/images/logo.svg"
                    alt="ResuMatch AI Logo"
                    className="w-10 h-10"
                />
                <p className="text-2xl font-bold text-gradient">
                    ResuMatch AI
                </p>
            </Link>

            {location.pathname !== "/upload" && (
                <NavLink
                    to="/upload"
                    className="primary-button flex items-center gap-1"
                    aria-label="Upload Resume"
                >
                    <Upload className="w-5 h-5" />
                    <span className="hidden md:inline ml-2">Upload</span>
                </NavLink>
            )}
        </nav>
    );
};

export default Navbar;
