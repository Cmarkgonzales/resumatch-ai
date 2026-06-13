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
    }, [auth.isAuthenticated, isAuthenticating, navigate]);

    return (
        <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef2ff_55%,#f5f3ff_100%)]">
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                <Navbar />
                {children}
            </section>
        </main>
    );
};

export default Layout;
