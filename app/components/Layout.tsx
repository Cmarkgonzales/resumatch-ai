import Navbar from "./Navbar";
import { useEffect } from "react";
import { usePuterStore } from "../lib/puter";
import { useNavigate } from "react-router";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { isAuthenticating, auth } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if(!isAuthenticating && !auth.isAuthenticated) navigate(`/?next=/home`);
    }, [isAuthenticating])

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-no-repeat bg-center min-h-full">
            <section className="main-section">
                <Navbar />
                {children}
            </section>
        </main>
    );
};

export default Layout;
