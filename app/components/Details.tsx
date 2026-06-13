import {
    CircleCheck,
    FileText,
    Layers3,
    MessageSquareText,
    Sparkles,
    TriangleAlert,
    type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

const categoryMeta = {
    toneStyle: { title: "Tone & Style", icon: MessageSquareText },
    content: { title: "Content", icon: FileText },
    structure: { title: "Structure", icon: Layers3 },
    skills: { title: "Skills", icon: Sparkles },
} as const;

const getScoreStyles = (score: number) => {
    if (score > 69) {
        return {
            badge: "bg-green-100 text-green-700",
            label: "Strong",
        };
    }
    if (score > 39) {
        return {
            badge: "bg-yellow-100 text-yellow-700",
            label: "Needs polish",
        };
    }
    return {
        badge: "bg-red-100 text-red-700",
        label: "Priority fix",
    };
};

const CategoryHeader = ({
    title,
    categoryScore,
    Icon,
}: {
    title: string;
    categoryScore: number;
    Icon: LucideIcon;
}) => {
    const styles = getScoreStyles(categoryScore);

    return (
        <div className="flex w-full items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-lg font-black text-slate-950">{title}</p>
                    <p className="text-sm text-text-secondary">{styles.label}</p>
                </div>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-sm font-bold", styles.badge)}>
                {categoryScore}/100
            </span>
        </div>
    );
};

const TipCard = ({
    type,
    tip,
    explanation,
}: {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
}) => {
    const Icon = type === "good" ? CircleCheck : TriangleAlert;
    const styles =
        type === "good"
            ? "border-green-100 bg-green-50 text-green-700"
            : "border-yellow-100 bg-yellow-50 text-yellow-700";

    return (
        <div className={cn("rounded-[8px] border p-4", styles)}>
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                    <p className="font-bold">{tip}</p>
                    {explanation && (
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {explanation}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => (
    <div className="grid gap-3 py-2">
        {tips.length > 0 ? (
            tips.map((tip, index) => (
                <TipCard
                    key={`${tip.tip}-${index}`}
                    type={tip.type}
                    tip={tip.tip}
                    explanation={tip.explanation}
                />
            ))
        ) : (
            <p className="rounded-[8px] bg-slate-50 px-4 py-3 text-sm text-text-secondary">
                No recommendations were returned for this category.
            </p>
        )}
    </div>
);

const Details = ({ feedback }: { feedback: Feedback }) => (
    <section className="rounded-[8px] border border-indigo-100 bg-white p-4 shadow-sm">
        <div className="mb-3 px-2">
            <h2 className="text-2xl font-black text-slate-950">Detailed recommendations</h2>
            <p className="mt-1 text-sm text-text-secondary">
                Open each category to review strengths and prioritized improvements.
            </p>
        </div>

        <Accordion>
            <AccordionItem id="tone-style">
                <AccordionHeader itemId="tone-style">
                    <CategoryHeader
                        title={categoryMeta.toneStyle.title}
                        categoryScore={feedback.toneAndStyle.score}
                        Icon={categoryMeta.toneStyle.icon}
                    />
                </AccordionHeader>
                <AccordionContent itemId="tone-style">
                    <CategoryContent tips={feedback.toneAndStyle.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="content">
                <AccordionHeader itemId="content">
                    <CategoryHeader
                        title={categoryMeta.content.title}
                        categoryScore={feedback.content.score}
                        Icon={categoryMeta.content.icon}
                    />
                </AccordionHeader>
                <AccordionContent itemId="content">
                    <CategoryContent tips={feedback.content.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="structure">
                <AccordionHeader itemId="structure">
                    <CategoryHeader
                        title={categoryMeta.structure.title}
                        categoryScore={feedback.structure.score}
                        Icon={categoryMeta.structure.icon}
                    />
                </AccordionHeader>
                <AccordionContent itemId="structure">
                    <CategoryContent tips={feedback.structure.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="skills">
                <AccordionHeader itemId="skills">
                    <CategoryHeader
                        title={categoryMeta.skills.title}
                        categoryScore={feedback.skills.score}
                        Icon={categoryMeta.skills.icon}
                    />
                </AccordionHeader>
                <AccordionContent itemId="skills">
                    <CategoryContent tips={feedback.skills.tips} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </section>
);

export default Details;
