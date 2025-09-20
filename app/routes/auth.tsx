import { usePuterStore } from "../lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { FileText, Sparkles, Briefcase, Lock, LoaderCircle, ShieldCheck } from "lucide-react";

export const meta = () => ([
    { title: "ResuMatch AI | Authentication" },
    { name: "description", content: "Log into your account" },
]);

const Auth = () => {
    const { isAuthenticating, auth } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse ?next= param, fallback to "/home"
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get("next") || "/home";

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate]);

    return (
        <main
            className="relative bg-[url('/images/bg-auth.svg')] bg-cover bg-center min-h-screen flex items-center justify-center px-6"
            role="main"
            aria-label="Authentication page"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-black/70 to-gray-900/90"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl w-full">
                <div className="text-white space-y-6 max-w-lg animate-in fade-in slide-in-from-left duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-shadow-lg">
                        Welcome to <span className="text-purple-300">ResuMatch AI</span>
                    </h1>
                    <p className="text-lg text-gray-200 leading-relaxed">
                        Your intelligent career assistant that analyzes your resume, matches you
                        with job opportunities, and helps you land interviews faster.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-purple-400" aria-hidden="true" />
                            <span>Upload and analyze your resume instantly</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-pink-400" aria-hidden="true" />
                            <span>Get AI-powered insights and improvements</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Briefcase className="w-6 h-6 text-indigo-400" aria-hidden="true" />
                            <span>Match with the best job opportunities</span>
                        </li>
                    </ul>
                    <div
                        className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
                        aria-label="Authentication security details"
                    >
                        <div className="flex items-center gap-3">
                            <Lock className="w-6 h-6 text-green-400" aria-hidden="true" />
                            <div>
                                <p className="font-semibold">Powered by Puter.js</p>
                                <p className="text-sm text-gray-300">
                                    Secure authentication and storage is handled through{" "}
                                    <a
                                        href="https://docs.puter.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-white focus:ring-2 focus:ring-purple-400 rounded"
                                    >
                                        Puter Cloud OS
                                    </a>
                                    , ensuring seamless login and data safety.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-bg-secondary shadow-2xl rounded-2xl p-10 w-[360px] max-sm:w-[90%] animate-in fade-in slide-in-from-right duration-700">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800">Get Started</h2>
                        <p className="text-gray-600 text-sm">
                            Sign in securely with Puter to continue your job journey
                        </p>
                    </div>
                    <div className="mt-8">
                        {isAuthenticating ? (
                            <button
                                disabled
                                aria-busy="true"
                                aria-live="polite"
                                className="auth-button bg-gray-300 cursor-not-allowed w-full flex items-center justify-center gap-2"
                            >
                                <LoaderCircle
                                    className="w-6 h-6 animate-spin"
                                    strokeWidth="3px"
                                    aria-hidden="true"
                                />
                                <span>Signing in...</span>
                            </button>
                            ) : (
                            <button
                                aria-label="Sign in with Puter authentication service"
                                className="auth-button w-full transform transition-all duration-300 hover:scale-105 active:scale-95"
                                onClick={auth.signIn}
                            >
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Auth;
