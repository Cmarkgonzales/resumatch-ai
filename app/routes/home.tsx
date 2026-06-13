import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpDown,
    CalendarDays,
    FilePlus2,
    Files,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import ResumeCard from "../components/ResumeCard";
import Layout from "../components/Layout";
import { getResumeListPattern } from "../lib/config";
import { safeNormalizeFeedback } from "../lib/feedback";
import { usePuterStore } from "../lib/puter";

type SortOption = "recent" | "score-desc" | "score-asc" | "company";
type ScoreFilter = "all" | "strong" | "good" | "needs-work";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "ResuMatch AI" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

const safeParseResume = (item: KVItem): Resume | null => {
    try {
        if (typeof item.value !== "string") return null;

        const resume = JSON.parse(item.value) as Resume;
        const feedback = safeNormalizeFeedback(resume.feedback);
        return feedback ? { ...resume, feedback } : resume;
    } catch {
        return null;
    }
};

const getScoreBand = (score: number): Exclude<ScoreFilter, "all"> => {
    if (score > 70) return "strong";
    if (score > 49) return "good";
    return "needs-work";
};

const getResumeTime = (resume: Resume) => {
    if (!resume.createdAt) return 0;
    const time = new Date(resume.createdAt).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const DashboardSkeleton = () => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div
                key={index}
                className="min-h-[520px] animate-pulse overflow-hidden rounded-[8px] border border-indigo-100 bg-white shadow-sm"
            >
                <div className="h-64 bg-indigo-50" />
                <div className="space-y-4 p-5">
                    <div className="h-4 w-32 rounded bg-slate-100" />
                    <div className="h-7 w-2/3 rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-12 rounded bg-slate-100" />
                </div>
            </div>
        ))}
    </div>
);

export default function Home() {
    const { isAuthenticating, auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

    useEffect(() => {
        if (!isAuthenticating && !auth.isAuthenticated) {
            navigate("/?next=/home");
        }
    }, [auth.isAuthenticated, isAuthenticating, navigate]);

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            setLoadError(null);

            try {
                const items = (await kv.list(getResumeListPattern(), true)) as
                    | KVItem[]
                    | undefined;

                const parsedResumes = (items || [])
                    .map(safeParseResume)
                    .filter((resume): resume is Resume => Boolean(resume));

                setResumes(parsedResumes);
            } catch (err) {
                setLoadError(
                    err instanceof Error ? err.message : "Failed to load resume analyses."
                );
            } finally {
                setLoadingResumes(false);
            }
        };

        loadResumes();
    }, [kv]);

    const dashboardStats = useMemo(() => {
        const total = resumes.length;
        const average =
            total === 0
                ? 0
                : Math.round(
                    resumes.reduce(
                        (sum, resume) => sum + (resume.feedback?.overallScore ?? 0),
                        0
                    ) / total
                );
        const latest = resumes.reduce((max, resume) => {
            return Math.max(max, getResumeTime(resume));
        }, 0);

        return {
            total,
            average,
            latestLabel: latest
                ? new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                }).format(new Date(latest))
                : "No activity",
        };
    }, [resumes]);

    const visibleResumes = useMemo(() => {
        return resumes
            .filter((resume) => {
                if (scoreFilter === "all") return true;
                return getScoreBand(resume.feedback?.overallScore ?? 0) === scoreFilter;
            })
            .sort((a, b) => {
                if (sortBy === "score-desc") {
                    return (b.feedback?.overallScore ?? 0) - (a.feedback?.overallScore ?? 0);
                }
                if (sortBy === "score-asc") {
                    return (a.feedback?.overallScore ?? 0) - (b.feedback?.overallScore ?? 0);
                }
                if (sortBy === "company") {
                    return (a.companyName || "").localeCompare(b.companyName || "");
                }
                return getResumeTime(b) - getResumeTime(a);
            });
    }, [resumes, scoreFilter, sortBy]);

    return (
        <Layout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="flex flex-col gap-3 rounded-[8px] border border-indigo-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                            Your Resume Analyses
                        </h1>
                        <p className="mt-1 text-sm text-text-secondary">
                            Track scores and feedback across all submissions.
                        </p>
                    </div>

                    <Link
                        to="/upload"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-2 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
                    >
                        <FilePlus2 className="h-5 w-5" aria-hidden="true" />
                        New Analysis
                    </Link>
                </section>

                <section className="mt-4 grid gap-3 md:grid-cols-3">
                    {[
                        {
                            label: "Total analyses",
                            value: dashboardStats.total,
                            icon: Files,
                        },
                        {
                            label: "Average score",
                            value: `${dashboardStats.average}/100`,
                            icon: TrendingUp,
                        },
                        {
                            label: "Recent activity",
                            value: dashboardStats.latestLabel,
                            icon: CalendarDays,
                        },
                    ].map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-[8px] border border-indigo-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-950">{value}</p>
                                    <p className="text-xs font-semibold text-text-secondary">{label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="mt-6">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-slate-950">
                                Your Recent Analyses
                            </h2>
                            <p className="mt-2 text-sm text-text-secondary">
                                {resumes.length === 0
                                    ? "Get started by uploading your first resume"
                                    : "Sort and filter feedback by score, company, or recency."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-border bg-white px-3 text-sm font-semibold text-text-secondary">
                                <Search className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span className="sr-only">Filter by score</span>
                                <select
                                    value={scoreFilter}
                                    onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
                                    className="bg-transparent text-text-primary outline-none"
                                >
                                    <option value="all">All scores</option>
                                    <option value="strong">Strong</option>
                                    <option value="good">Good Start</option>
                                    <option value="needs-work">Needs Work</option>
                                </select>
                            </label>

                            <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-border bg-white px-3 text-sm font-semibold text-text-secondary">
                                <ArrowUpDown className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span className="sr-only">Sort resumes</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="bg-transparent text-text-primary outline-none"
                                >
                                    <option value="recent">Newest first</option>
                                    <option value="score-desc">Highest score</option>
                                    <option value="score-asc">Lowest score</option>
                                    <option value="company">Company A-Z</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {loadError && (
                        <div className="mb-5 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {loadError}
                        </div>
                    )}

                    {loadingResumes ? (
                        <DashboardSkeleton />
                    ) : resumes.length === 0 ? (
                        <div className="rounded-[8px] border border-dashed border-indigo-200 bg-white p-8 text-center shadow-sm">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                                <Sparkles className="h-8 w-8" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-950">
                                Start with your first resume analysis
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                                Add the job details and upload a PDF resume. ResuMatch AI will score your resume and turn the review into actionable edits.
                            </p>
                            <Link
                                to="/upload"
                                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <FilePlus2 className="h-5 w-5" aria-hidden="true" />
                                Upload Resume
                            </Link>
                        </div>
                    ) : visibleResumes.length === 0 ? (
                        <div className="rounded-[8px] border border-indigo-100 bg-white p-6 text-center text-text-secondary">
                            No analyses match this filter.
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {visibleResumes.map((resume) => (
                                <ResumeCard key={resume.id} resume={resume} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
