interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    const getBadge = () => {
        if (score > 70) return { color: "bg-badge-green text-green-600", text: "Strong" };
        if (score > 49) return { color: "bg-badge-yellow text-yellow-600", text: "Good Start" };
        return { color: "bg-badge-red text-red-600", text: "Needs Work" };
    };

    const { color, text } = getBadge();

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}
            aria-label={`Score: ${text}`}
        >
            {text}
        </span>
    );
};

export default ScoreBadge;
