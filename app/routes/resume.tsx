import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Copy,
    Download,
    FilePlus2,
    FileText,
    Home,
} from "lucide-react";
import ATS from "../components/ATS";
import Details from "../components/Details";
import Summary from "../components/Summary";
import { getResumeKey } from "../lib/config";
import { safeNormalizeFeedback } from "../lib/feedback";
import { usePuterStore } from "../lib/puter";

export const meta = () => ([
    { title: "ResuMatch AI | Resume Feedback" },
    { name: "description", content: "Detailed overview of your resume" },
]);

const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
};

const FeedbackSkeleton = () => (
    <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
            <div
                key={index}
                className="animate-pulse rounded-[8px] border border-indigo-100 bg-white p-6 shadow-sm"
            >
                <div className="mb-4 h-6 w-44 rounded bg-slate-100" />
                <div className="space-y-3">
                    <div className="h-4 rounded bg-slate-100" />
                    <div className="h-4 w-5/6 rounded bg-slate-100" />
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
            </div>
        ))}
    </div>
);

const ActionButtonSkeleton = ({ width = "w-28" }: { width?: string }) => (
    <div
        className={`min-h-11 ${width} animate-pulse rounded-[8px] border border-indigo-100 bg-white shadow-sm`}
    />
);

const headerSecondaryActionClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-3 py-2 text-center text-sm font-bold text-text-primary transition hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-4";

const headerPrimaryActionClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-3 py-2 text-center text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-4";

const MetadataSkeleton = () => (
    <div className="grid gap-4 rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="mt-3 h-5 w-32 rounded bg-slate-100" />
            </div>
        ))}
    </div>
);

const Resume = () => {
    const { fs, kv } = usePuterStore();
    const { id } = useParams();
    const [resumeData, setResumeData] = useState<Resume | null>(null);
    const [resumeBlob, setResumeBlob] = useState<Blob | null>(null);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

    const resumeUrl = useMemo(
        () => (resumeBlob ? URL.createObjectURL(resumeBlob) : ""),
        [resumeBlob]
    );
    const imageUrl = useMemo(
        () => (imageBlob ? URL.createObjectURL(imageBlob) : ""),
        [imageBlob]
    );

    useEffect(() => {
        const loadResume = async () => {
            if (!id) {
                setIsLoading(false);
                return;
            }

            try {
                const resume = await kv.get(getResumeKey(id));
                if (typeof resume !== "string") {
                    setIsLoading(false);
                    return;
                }

                const data = JSON.parse(resume) as Resume;
                const normalizedFeedback = safeNormalizeFeedback(data.feedback);
                setResumeData(
                    normalizedFeedback
                        ? { ...data, feedback: normalizedFeedback }
                        : data
                );

                const rBlob = await fs.read(data.resumePath);
                if (rBlob) setResumeBlob(new Blob([rBlob], { type: "application/pdf" }));

                const iBlob = await fs.read(data.imagePath);
                if (iBlob) setImageBlob(new Blob([iBlob]));

                setFeedback(normalizedFeedback);
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();
    }, [id]);

    useEffect(() => {
        return () => {
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl, resumeUrl]);

    const handleCopyFeedback = async () => {
        if (!feedback) return;

        const summary = [
            `Overall score: ${feedback.overallScore}/100`,
            `ATS score: ${feedback.ATS.score}/100`,
            "",
            "Top ATS notes:",
            ...feedback.ATS.tips.map((tip) => `- ${tip.tip}`),
        ].join("\n");

        try {
            await navigator.clipboard.writeText(summary);
            setCopyStatus("copied");
            setTimeout(() => setCopyStatus("idle"), 1800);
        } catch (err) {
            console.error("Failed to copy feedback:", err);
        }
    };

    if (!isLoading && !resumeData) {
        return (
            <main className="min-h-screen bg-bg-secondary px-4 py-8">
                <div className="mx-auto max-w-2xl rounded-[8px] border border-indigo-100 bg-white p-8 text-center shadow-sm">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden="true" />
                    <h1 className="text-3xl font-black text-slate-950">Resume not found</h1>
                    <p className="mt-3 text-text-secondary">
                        This analysis may have been deleted or the link is no longer valid.
                    </p>
                    <Link
                        to="/home"
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Home className="h-4 w-4" aria-hidden="true" />
                        Back to dashboard
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef2ff_55%,#f5f3ff_100%)] pb-10">
            <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/90 px-4 py-4 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {isLoading ? (
                        <>
                            <ActionButtonSkeleton width="w-full sm:w-24" />
                            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end" aria-hidden="true">
                                <ActionButtonSkeleton width="w-full sm:w-32" />
                                <ActionButtonSkeleton width="w-full sm:w-36" />
                                <ActionButtonSkeleton width="w-full sm:w-24" />
                                <ActionButtonSkeleton width="w-full sm:w-40" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/home"
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-border bg-white px-4 py-2 text-sm font-bold text-text-primary transition hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-fit"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Back
                            </Link>

                            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                                {resumeUrl && (
                                    <a
                                        href={resumeUrl}
                                        download
                                        className={headerSecondaryActionClass}
                                    >
                                        <Download className="h-4 w-4" aria-hidden="true" />
                                        <span className="hidden sm:inline">Download PDF</span>
                                        <span className="sm:hidden">Download</span>
                                    </a>
                                )}
                                <button
                                    onClick={handleCopyFeedback}
                                    disabled={!feedback}
                                    className={`${headerSecondaryActionClass} disabled:opacity-50`}
                                >
                                    <Copy className="h-4 w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">
                                        {copyStatus === "copied" ? "Copied" : "Copy Feedback"}
                                    </span>
                                    <span className="sm:hidden">
                                        {copyStatus === "copied" ? "Copied" : "Copy"}
                                    </span>
                                </button>
                                <Link
                                    to="/upload"
                                    className={headerPrimaryActionClass}
                                >
                                    <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">Analyze Another</span>
                                    <span className="sm:hidden">Analyze</span>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="h-fit lg:sticky lg:top-28" aria-label="Uploaded Resume Preview">
                    <div className="rounded-[8px] border border-indigo-100 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            {isLoading ? (
                                <div className="w-full animate-pulse">
                                    <div className="h-6 w-40 rounded bg-slate-100" />
                                    <div className="mt-2 h-4 w-56 rounded bg-slate-100" />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">Resume preview</h2>
                                    <p className="text-sm text-text-secondary">Click the preview to open the PDF.</p>
                                </div>
                            )}
                        </div>

                        {imageUrl && resumeUrl ? (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open full resume"
                                className="block overflow-hidden rounded-[8px] border border-border bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <img
                                    src={imageUrl}
                                    alt="Uploaded Resume Preview"
                                    className="w-full object-contain animate-in fade-in duration-500"
                                />
                            </a>
                        ) : (
                            <div className="h-[70vh] min-h-[360px] animate-pulse rounded-[8px] bg-gradient-to-br from-indigo-50 to-slate-100" />
                        )}
                    </div>
                </section>

                <section className="flex flex-col gap-6">
                    {isLoading ? (
                        <MetadataSkeleton />
                    ) : resumeData && (
                        <div className="grid gap-4 rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm md:grid-cols-3">
                            <div>
                                <p className="text-xs font-bold uppercase text-text-secondary">Company</p>
                                <p className="mt-1 font-bold text-text-primary">
                                    {resumeData.companyName || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-secondary">Role</p>
                                <p className="mt-1 font-bold text-text-primary">
                                    {resumeData.jobTitle || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-text-secondary">Analyzed</p>
                                <p className="mt-1 font-bold text-text-primary">
                                    {formatDate(resumeData.createdAt)}
                                </p>
                            </div>
                        </div>
                    )}

                    {feedback ? (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Summary feedback={feedback} />
                            <ATS
                                score={feedback.ATS.score || 0}
                                suggestions={feedback.ATS.tips || []}
                            />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <FeedbackSkeleton />
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
