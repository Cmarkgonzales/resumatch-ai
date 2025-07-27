import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="flex align-center gap-2">
                <img src="/resumatch-ai-logo.svg" alt="ResuMatch AI Logo" className="w-10 h-10" />
                <Link to="/">
                    <p className="text-2xl font-bold text-gradient">ResuMatch AI</p>
                </Link>
            </div>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    )
}
export default Navbar
