import { cn } from "../lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";
import { CircleCheck, TriangleAlert } from "lucide-react";

const getScoreStyles = (score: number) => {
    if (score > 69) {
        return {
            badge: "bg-badge-green text-badge-green-text",
            color: "text-green-700",
            Icon: CircleCheck,
        };
    }
    if (score > 39) {
        return {
            badge: "bg-badge-yellow text-badge-yellow-text",
            color: "text-yellow-700",
            Icon: TriangleAlert,
        };
    }
    return {
        badge: "bg-badge-red text-badge-red-text",
        color: "text-red-700",
        Icon: TriangleAlert,
    };
};

const ScoreBadge = ({ score }: { score: number }) => {
    const { badge, color, Icon } = getScoreStyles(score);
    return (
        <div
            className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-[96px]",
                badge.split(" ")[0]
            )}
        >
            <Icon className={cn("size-4", color)} />
            <p className={cn("text-sm font-medium", badge.split(" ")[1])}>
                {score}/100
            </p>
        </div>
    );
};

const CategoryHeader = ({
    title,
    categoryScore,
}: {
        title: string;
        categoryScore: number;
}) => (
    <div className="flex items-center gap-4 py-2">
        <p className="text-2xl font-semibold">{title}</p>
        <ScoreBadge score={categoryScore} />
    </div>
);

const TipItem = ({
    type,
    tip,
    explanation,
    detailed,
}: {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
    detailed?: boolean;
}) => {
    const Icon = type === "good" ? CircleCheck : TriangleAlert;
    const iconColor = type === "good" ? "text-green-600" : "text-amber-600";

    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-4 rounded-2xl",
                detailed &&
                (type === "good"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-700")
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className={cn("w-6 h-6 shrink-0", iconColor)} />
                <p className={cn("text-xl", detailed && "font-semibold")}>{tip}</p>
            </div>
            {detailed && explanation && <p>{explanation}</p>}
        </div>
    );
};

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => (
    <div className="flex flex-col items-center w-full gap-4">
        <div className="grid w-full grid-cols-2 gap-4 rounded-lg bg-gray-50 px-5 py-4">
            {tips.map((tip, i) => (
                <div className="flex items-center gap-2" key={i}>
                    <TipItem type={tip.type} tip={tip.tip} />
                </div>
            ))}
        </div>
        <div className="flex flex-col w-full gap-4">
            {tips.map((tip, i) => (
                <TipItem
                    key={i + tip.tip}
                    type={tip.type}
                    tip={tip.tip}
                    explanation={tip.explanation}
                    detailed
                />
            ))}
        </div>
    </div>
);

const Details = ({ feedback }: { feedback: Feedback }) => (
    <div className="flex flex-col w-full gap-4">
        <Accordion>
            <AccordionItem id="tone-style">
                <AccordionHeader itemId="tone-style">
                    <CategoryHeader
                        title="Tone & Style"
                        categoryScore={feedback.toneAndStyle.score}
                    />
                </AccordionHeader>
                <AccordionContent itemId="tone-style">
                    <CategoryContent tips={feedback.toneAndStyle.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="content">
                <AccordionHeader itemId="content">
                    <CategoryHeader
                        title="Content"
                        categoryScore={feedback.content.score}
                    />
                </AccordionHeader>
                <AccordionContent itemId="content">
                    <CategoryContent tips={feedback.content.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="structure">
                <AccordionHeader itemId="structure">
                    <CategoryHeader
                        title="Structure"
                        categoryScore={feedback.structure.score}
                    />
                </AccordionHeader>
                <AccordionContent itemId="structure">
                    <CategoryContent tips={feedback.structure.tips} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem id="skills">
                <AccordionHeader itemId="skills">
                    <CategoryHeader
                        title="Skills"
                        categoryScore={feedback.skills.score}
                    />
                </AccordionHeader>
                <AccordionContent itemId="skills">
                    <CategoryContent tips={feedback.skills.tips} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

export default Details;
