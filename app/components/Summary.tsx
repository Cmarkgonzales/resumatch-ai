import { BarChart3, FileText, Layers3, MessageSquareText, Sparkles } from "lucide-react";
import ScoreBadge from "../components/ScoreBadge";
import ScoreGauge from "../components/ScoreGauge";

const categories = [
    { key: "toneAndStyle", title: "Tone & Style", icon: MessageSquareText },
    { key: "content", title: "Content", icon: FileText },
    { key: "structure", title: "Structure", icon: Layers3 },
    { key: "skills", title: "Skills", icon: Sparkles },
] as const;

const getTextColor = (score: number) => {
    if (score > 70) return "text-green-700";
    if (score > 49) return "text-yellow-700";
    return "text-red-700";
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <section className="rounded-[8px] border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex justify-center rounded-[8px] bg-bg-secondary p-4 md:w-56">
                    <ScoreGauge score={feedback.overallScore} />
                </div>

                <div className="flex-1">
                    <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        <BarChart3 className="h-4 w-4" aria-hidden="true" />
                        Overall resume score
                    </p>
                    <h2 className="text-3xl font-black text-slate-950">
                        {feedback.overallScore}/100
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                        This score combines ATS readiness, tone, structure, content strength, and skill alignment.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {categories.map(({ key, title, icon: Icon }) => {
                    const score = feedback[key].score;
                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-4 rounded-[8px] border border-border bg-slate-50 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-primary shadow-sm">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary">{title}</p>
                                    <ScoreBadge score={score} />
                                </div>
                            </div>
                            <p className="text-lg font-black">
                                <span className={getTextColor(score)}>{score}</span>
                                <span className="text-text-secondary">/100</span>
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Summary;
