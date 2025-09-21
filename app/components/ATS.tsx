import React from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";

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
            gradient: "from-green-100",
            subtitle: "Great Job!",
            iconSrc: "/icons/ats-good.svg",
        };
    }

    if (score > 49) {
        return {
            gradient: "from-yellow-100",
            subtitle: "Good Start",
            iconSrc: "/icons/ats-warning.svg",
        };
    }

    return {
        gradient: "from-red-100",
        subtitle: "Needs Improvement",
        iconSrc: "/icons/ats-bad.svg",
    };
};

const SuggestionItem = ({ suggestion }: { suggestion: Suggestion }) => {
    const Icon = suggestion.type === "good" ? CircleCheck : TriangleAlert;
    return (
        <div className="flex items-start gap-3">
            <Icon
                className={`w-5 h-5 mt-1 ${
                suggestion.type === "good" ? "text-green-600" : "text-amber-600"
                }`}
            />
            <p
                className={
                suggestion.type === "good" ? "text-green-700" : "text-amber-700"
                }
            >
                {suggestion.tip}
            </p>
        </div>
    );
};

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    const { gradient, subtitle, iconSrc } = getATSStyles(score);

    return (
        <div
            className={`bg-gradient-to-b ${gradient} to-white rounded-2xl shadow-md w-full p-6`}
        >
            <div className="flex items-center gap-4 mb-6">
                <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
                <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
                <p className="text-gray-600 mb-4">
                    This score represents how well your resume is likely to perform in
                    Applicant Tracking Systems used by employers.
                </p>

                <div className="space-y-3">
                    {suggestions.map((s, i) => (
                        <SuggestionItem key={i} suggestion={s} />
                    ))}
                </div>
            </div>

            <p className="text-gray-700 italic">
                Keep refining your resume to improve your chances of getting past ATS
                filters and into the hands of recruiters.
            </p>
        </div>
    );
};

export default ATS;
