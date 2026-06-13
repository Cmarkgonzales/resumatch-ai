import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    LoaderCircle,
    Lock,
    ShieldCheck,
    Sparkles,
    Target,
} from "lucide-react";
import { usePuterStore } from "../lib/puter";

export const meta = () => ([
    { title: "ResuMatch AI | Authentication" },
    { name: "description", content: "Log into your account" },
]);

const features = [
    {
        title: "Resume Intelligence",
        description:
            "Surface ATS gaps, keyword strength, and structure issues before submitting.",
        icon: FileText,
        accent: "from-indigo-500 to-blue-500",
    },
    {
        title: "Role-Matched Feedback",
        description: "Compare each resume against the exact job title and description.",
        icon: Target,
        accent: "from-violet-500 to-fuchsia-500",
    },
    {
        title: "Actionable Improvements",
        description: "Turn analysis into focused edits with prioritized recommendations.",
        icon: Sparkles,
        accent: "from-cyan-500 to-indigo-500",
    },
];

const trustSignals = [
    { label: "Secure Puter authentication", icon: ShieldCheck },
    { label: "Private file storage", icon: Lock },
    { label: "AI-assisted review flow", icon: Sparkles },
];

const Auth = () => {
    const { isAuthenticating, auth } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get("next") || "/home";

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate]);

    return (
        <main
            className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#eef2ff_0%,#f8fbff_45%,#f5f3ff_100%)] px-5 py-6 text-text-primary sm:px-8 lg:px-10"
            role="main"
            aria-label="Authentication page"
        >
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                <div className="absolute left-0 top-24 h-[420px] w-full -skew-y-6 bg-gradient-to-r from-indigo-100/70 via-white/40 to-violet-100/70" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-10">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.svg"
                            alt="ResuMatch AI"
                            className="h-10 w-10 rounded-[8px] bg-white shadow-sm ring-1 ring-indigo-100"
                        />
                        <span className="text-lg font-bold text-primary">ResuMatch AI</span>
                    </div>
                    <a
                        href="https://docs.puter.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-indigo-200 hover:bg-white"
                    >
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Puter secured
                    </a>
                </header>

                <section className="grid flex-1 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                        <div className="space-y-5">
                            <h1 className="max-w-4xl text-5xl font-black leading-[1.03] tracking-normal text-slate-950 md:text-6xl xl:text-7xl">
                                Land stronger interviews with{" "}
                                <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                                    resume intelligence
                                </span>
                            </h1>

                            <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                                ResuMatch AI scores your resume against the role you want
                                and turns the review into clear edits before you apply.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {features.map(({ title, description, icon: Icon, accent }) => (
                                <article
                                    key={title}
                                    className="group rounded-[8px] border border-indigo-100 bg-white/85 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                                >
                                    <div
                                        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] bg-gradient-to-br ${accent} text-white shadow-md transition group-hover:scale-105`}
                                    >
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <aside className="animate-in fade-in slide-in-from-right duration-700">
                        <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-indigo-200">
                            <div className="relative space-y-5">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <p className="text-sm font-semibold uppercase text-indigo-100">
                                            Secure access
                                        </p>
                                        <h2 className="mt-3 text-3xl font-black !text-white md:text-4xl">
                                            Start your resume review
                                        </h2>
                                    </div>
                                </div>

                                <div className="group relative overflow-hidden rounded-[8px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 shadow-lg shadow-indigo-950/20 backdrop-blur p-2">
                                    <img
                                        src="/images/resumatch-hero.png"
                                        alt="ResuMatch AI resume analysis preview"
                                        className="h-auto max-h-96 w-full object-contain object-center opacity-95 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100 sm:max-h-[28rem] lg:max-h-[36rem] xl:max-h-[40rem]"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {trustSignals.map(({ label, icon: Icon }) => (
                                        <div key={label} className="flex items-center gap-3 text-sm text-indigo-50">
                                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {isAuthenticating ? (
                                    <button
                                        disabled
                                        aria-busy="true"
                                        aria-live="polite"
                                        className="flex w-full items-center justify-center gap-3 rounded-full bg-white/20 px-6 py-4 text-lg font-bold text-white ring-1 ring-white/30"
                                    >
                                        <LoaderCircle
                                            className="h-5 w-5 animate-spin"
                                            strokeWidth="3px"
                                            aria-hidden="true"
                                        />
                                        <span>Signing in...</span>
                                    </button>
                                ) : (
                                    <button
                                        aria-label="Sign in with Puter authentication service"
                                        className="group flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-lg font-black text-primary shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl active:translate-y-0"
                                        onClick={auth.signIn}
                                    >
                                        <span>Sign In</span>
                                        <ArrowRight
                                            className="h-5 w-5 transition group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="grid gap-4 rounded-[8px] border border-indigo-100 bg-white/80 p-4 shadow-sm backdrop-blur md:grid-cols-3">
                    {[
                        "ATS scoring tuned for real job descriptions",
                        "Feedback saved to your private Puter workspace",
                        "Clear next steps for stronger applications",
                    ].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                        >
                            <CheckCircle2
                                className="h-5 w-5 shrink-0 text-primary"
                                aria-hidden="true"
                            />
                            <span>{item}</span>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
};

export default Auth;
