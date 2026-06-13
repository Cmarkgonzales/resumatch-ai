import { Link } from "react-router";
import { ArrowRight, Building2, CalendarDays, FileText, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "../lib/puter";

const getScoreLabel = (score: number) => {
    if (score > 70) return "Strong";
    if (score > 49) return "Good Start";
    return "Needs Work";
};

const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const ResumeCard = ({ resume }: { resume: Resume }) => {
    const { id, companyName, jobTitle, feedback, imagePath, createdAt } = resume;
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState("");

    const score = feedback?.overallScore ?? 0;
    const scoreLabel = useMemo(() => getScoreLabel(score), [score]);

    useEffect(() => {
        let objectUrl = "";

        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if (!blob) return;

            objectUrl = URL.createObjectURL(blob);
            setResumeUrl(objectUrl);
        };

        loadResume();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fs, imagePath]);

    return (
        <Link
            to={`/resume/${id}`}
            className="group flex h-full min-h-[520px] flex-col overflow-hidden rounded-[8px] border border-indigo-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Open feedback for ${companyName || jobTitle || "resume"}`}
        >
            <div className="relative h-64 overflow-hidden bg-bg-secondary">
                {resumeUrl ? (
                    <img
                        src={resumeUrl}
                        alt="Resume preview"
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="h-full w-full animate-pulse bg-gradient-to-br from-indigo-50 to-slate-100" />
                )}
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-sm ring-1 ring-indigo-100 transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 group-focus-visible:bg-primary group-focus-visible:text-white">
                    <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        {scoreLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-text-secondary">
                            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {companyName || "Company not specified"}
                        </p>
                        <h2 className="break-words text-xl font-black text-slate-950">
                            {jobTitle || "Resume analysis"}
                        </h2>
                    </div>
                    <div className="shrink-0">
                        <ScoreCircle score={score} />
                    </div>
                </div>

                <div className="grid gap-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{formatDate(createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{score}/100 overall score</span>
                    </div>
                </div>

                <div className="mt-auto flex min-h-11 items-center border-t border-border pt-4 text-primary">
                    <span className="flex w-full items-center justify-between gap-3 text-sm font-semibold">
                        <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            View feedback
                        </span>
                        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;
