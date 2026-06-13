import React from "react";
import { CircleCheck, ShieldCheck, TriangleAlert } from "lucide-react";

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const getATSStyles = (score: number) => {
    if (score > 69) {
        return {
            bg: "bg-green-50 border-green-100",
            text: "text-green-700",
            subtitle: "ATS-ready foundation",
        };
    }

    if (score > 49) {
        return {
            bg: "bg-yellow-50 border-yellow-100",
            text: "text-yellow-700",
            subtitle: "Good start with clear gaps",
        };
    }

    return {
        bg: "bg-red-50 border-red-100",
        text: "text-red-700",
        subtitle: "Needs targeted improvements",
    };
};

const SuggestionItem = ({ suggestion }: { suggestion: Suggestion }) => {
    const Icon = suggestion.type === "good" ? CircleCheck : TriangleAlert;
    const styles =
        suggestion.type === "good"
            ? "border-green-100 bg-green-50 text-green-700"
            : "border-yellow-100 bg-yellow-50 text-yellow-700";

    return (
        <div className={`flex items-start gap-3 rounded-[8px] border p-3 ${styles}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm leading-6">{suggestion.tip}</p>
        </div>
    );
};

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    const styles = getATSStyles(score);

    return (
        <section className={`rounded-[8px] border p-6 shadow-sm ${styles.bg}`}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white shadow-sm">
                        <ShieldCheck className={`h-6 w-6 ${styles.text}`} aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-950">ATS Score</h2>
                        <p className={`text-sm font-bold ${styles.text}`}>{styles.subtitle}</p>
                    </div>
                </div>
                <div className="rounded-[8px] bg-white px-4 py-2 text-2xl font-black text-slate-950 shadow-sm">
                    {score}/100
                </div>
            </div>

            <p className="mb-5 text-sm leading-6 text-text-secondary">
                This estimates how well your resume can pass common Applicant Tracking System checks before a recruiter reviews it.
            </p>

            <div className="grid gap-3">
                {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                        <SuggestionItem key={`${suggestion.tip}-${index}`} suggestion={suggestion} />
                    ))
                ) : (
                    <p className="rounded-[8px] bg-white px-4 py-3 text-sm text-text-secondary">
                        No ATS suggestions were returned for this analysis.
                    </p>
                )}
            </div>
        </section>
    );
};

export default ATS;
