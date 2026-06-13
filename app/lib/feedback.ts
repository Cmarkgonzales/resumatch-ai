type UnknownRecord = Record<string, unknown>;
type AtsFeedback = Feedback["ATS"];
type CategoryFeedback = Feedback["content"];
type CategoryTip = CategoryFeedback["tips"][number];

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const stripJsonFence = (value: string) =>
    value
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

const getValue = (source: UnknownRecord, keys: string[]) => {
    for (const key of keys) {
        if (key in source) return source[key];
    }

    return undefined;
};

const getRecord = (source: UnknownRecord, keys: string[]) => {
    const value = getValue(source, keys);
    return isRecord(value) ? value : {};
};

const hasKeys = (source: UnknownRecord) => Object.keys(source).length > 0;

const getSectionRecord = (
    source: UnknownRecord,
    fallbackSource: UnknownRecord,
    keys: string[]
) => {
    const directRecord = getRecord(source, keys);
    return hasKeys(directRecord) ? directRecord : getRecord(fallbackSource, keys);
};

const parseScore = (value: unknown) => {
    const score =
        typeof value === "string"
            ? Number(value.replace("%", "").trim())
            : Number(value);

    if (!Number.isFinite(score)) return null;

    return Math.min(100, Math.max(0, Math.round(score)));
};

const averageScore = (scores: number[]) => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
};

const normalizeTipType = (value: unknown): "good" | "improve" => {
    if (typeof value !== "string") return "improve";

    const normalized = value.toLowerCase();
    return normalized === "good" || normalized === "positive" || normalized === "strength"
        ? "good"
        : "improve";
};

const normalizeTip = (value: unknown, includeExplanation: boolean) => {
    if (typeof value === "string") {
        return {
            type: "improve" as const,
            tip: value,
            explanation: includeExplanation ? "" : undefined,
        };
    }

    if (!isRecord(value)) return null;

    const tip =
        getValue(value, ["tip", "title", "summary", "message", "recommendation"]) ?? "";
    const explanation =
        getValue(value, ["explanation", "details", "description", "reason"]) ?? "";

    if (typeof tip !== "string" || !tip.trim()) return null;

    return {
        type: normalizeTipType(getValue(value, ["type", "status", "kind"])),
        tip: tip.trim(),
        explanation: includeExplanation && typeof explanation === "string"
            ? explanation.trim()
            : "",
    };
};

const normalizeTips = (value: unknown, includeExplanation: boolean) => {
    if (!Array.isArray(value)) return [];

    return value
        .map((tip) => normalizeTip(tip, includeExplanation))
        .filter((tip): tip is CategoryTip => Boolean(tip));
};

const missingScoreTip = (category: string): CategoryTip => ({
    type: "improve",
    tip: `${category} score was not returned`,
    explanation:
        "The AI response did not include a score for this category. Re-run the analysis to generate a complete breakdown.",
});

const normalizeCategory = (
    source: UnknownRecord,
    category: string,
    fallbackScore = 0
): CategoryFeedback => {
    const scoreValue = getValue(source, ["score", "rating", "value"]);
    const score = parseScore(scoreValue);
    const tips = normalizeTips(getValue(source, ["tips", "suggestions", "recommendations"]), true);

    return {
        score: score ?? fallbackScore,
        tips: score === null ? [missingScoreTip(category), ...tips] : tips,
    };
};

const normalizeAts = (source: UnknownRecord, fallbackScore = 0): AtsFeedback => {
    const scoreValue = getValue(source, ["score", "rating", "value"]);
    const score = parseScore(scoreValue);
    const tips = normalizeTips(getValue(source, ["tips", "suggestions", "recommendations"]), false)
        .map(({ type, tip }) => ({ type, tip }));

    return {
        score: score ?? fallbackScore,
        tips: score === null
            ? [
                {
                    type: "improve",
                    tip: "ATS score was not returned. Re-run the analysis to generate a complete breakdown.",
                },
                ...tips,
            ]
            : tips,
    };
};

const withScoreFallback = (
    source: UnknownRecord,
    scoreSource: UnknownRecord,
    keys: string[]
) => {
    const ownScore = parseScore(getValue(source, ["score", "rating", "value"]));
    if (ownScore !== null) return source;

    const fallbackScore = getValue(scoreSource, keys);
    return fallbackScore === undefined ? source : { ...source, score: fallbackScore };
};

export const normalizeFeedback = (input: unknown): Feedback => {
    const source =
        typeof input === "string" && input.trim()
            ? JSON.parse(stripJsonFence(input)) as unknown
            : input;

    if (!isRecord(source)) {
        throw new Error("Feedback response is not a valid object.");
    }

    const scoreSource = getRecord(source, [
        "scores",
        "criteriaScores",
        "criteria_scores",
        "categoryScores",
        "category_scores",
    ]);
    const sectionSource = getRecord(source, ["criteria", "categories", "sections"]);

    const atsSource = getSectionRecord(source, sectionSource, [
        "ATS",
        "ats",
        "applicantTrackingSystem",
        "applicant_tracking_system",
    ]);
    const toneSource = getSectionRecord(source, sectionSource, [
        "toneAndStyle",
        "tone_and_style",
        "toneStyle",
        "tone_style",
        "tone",
        "style",
    ]);
    const contentSource = getSectionRecord(source, sectionSource, [
        "content",
        "resumeContent",
        "resume_content",
    ]);
    const structureSource = getSectionRecord(source, sectionSource, [
        "structure",
        "format",
        "formatting",
        "layout",
    ]);
    const skillsSource = getSectionRecord(source, sectionSource, [
        "skills",
        "skillAlignment",
        "skill_alignment",
    ]);

    const ats = withScoreFallback(atsSource, scoreSource, ["ATS", "ats", "atsScore", "ats_score"]);
    const tone = withScoreFallback(toneSource, scoreSource, [
        "toneAndStyle",
        "tone_and_style",
        "toneStyle",
        "tone_style",
    ]);
    const content = withScoreFallback(contentSource, scoreSource, ["content", "contentScore"]);
    const structure = withScoreFallback(structureSource, scoreSource, [
        "structure",
        "structureScore",
        "formatting",
    ]);
    const skills = withScoreFallback(skillsSource, scoreSource, [
        "skills",
        "skillsScore",
        "skillAlignment",
        "skill_alignment",
    ]);

    const returnedScores = [
        parseScore(getValue(ats, ["score", "rating", "value"])),
        parseScore(getValue(tone, ["score", "rating", "value"])),
        parseScore(getValue(content, ["score", "rating", "value"])),
        parseScore(getValue(structure, ["score", "rating", "value"])),
        parseScore(getValue(skills, ["score", "rating", "value"])),
    ].filter((score): score is number => score !== null);

    const overallScore =
        parseScore(getValue(source, ["overallScore", "overall_score", "overall", "score"])) ??
        parseScore(getValue(scoreSource, ["overallScore", "overall_score", "overall"])) ??
        averageScore(returnedScores);

    return {
        overallScore,
        ATS: normalizeAts(ats),
        toneAndStyle: normalizeCategory(tone, "Tone and style"),
        content: normalizeCategory(content, "Content"),
        structure: normalizeCategory(structure, "Structure"),
        skills: normalizeCategory(skills, "Skills"),
    };
};

export const safeNormalizeFeedback = (input: unknown): Feedback | null => {
    if (!input) return null;

    try {
        return normalizeFeedback(input);
    } catch {
        return null;
    }
};

const unreadableResumeMessage =
    "The AI could not read the resume content from the uploaded PDF. Try exporting the resume as a text-based PDF, then run the analysis again.";

const isUnreadableResumeFeedback = (feedback: Feedback) => {
    const scores = [
        feedback.overallScore,
        feedback.ATS.score,
        feedback.toneAndStyle.score,
        feedback.content.score,
        feedback.structure.score,
        feedback.skills.score,
    ];

    if (!scores.every((score) => score === 0)) return false;

    const text = [
        ...feedback.ATS.tips.map((tip) => tip.tip),
        ...feedback.toneAndStyle.tips.flatMap((tip) => [tip.tip, tip.explanation]),
        ...feedback.content.tips.flatMap((tip) => [tip.tip, tip.explanation]),
        ...feedback.structure.tips.flatMap((tip) => [tip.tip, tip.explanation]),
        ...feedback.skills.tips.flatMap((tip) => [tip.tip, tip.explanation]),
    ].join(" ").toLowerCase();

    return [
        "resume content missing",
        "missing resume content",
        "no resume content",
        "resume text is missing",
        "could not read",
        "unable to read",
        "cannot access",
        "content was not provided",
    ].some((pattern) => text.includes(pattern));
};

export const parseFeedbackResponse = (feedbackText: string): Feedback => {
    try {
        const feedback = normalizeFeedback(feedbackText);
        if (isUnreadableResumeFeedback(feedback)) {
            throw new Error(unreadableResumeMessage);
        }

        return feedback;
    } catch (err) {
        if (err instanceof Error && err.message === unreadableResumeMessage) {
            throw err;
        }

        throw new Error(
            "The AI returned feedback in an invalid JSON format. Please try analyzing again."
        );
    }
};
