const env = import.meta.env;

const getString = (key: string, fallback: string): string => {
    const value = env[key];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const getNumber = (
    key: string,
    fallback: number,
    options: { min?: number; max?: number } = {}
): number => {
    const value = env[key];
    if (typeof value !== "string" || !value.trim()) return fallback;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    if (options.min !== undefined && parsed < options.min) return fallback;
    if (options.max !== undefined && parsed > options.max) return fallback;

    return parsed;
};

const defaultImageExtension = (mimeType: string): string => {
    if (mimeType === "image/jpeg") return "jpg";

    return mimeType.split("/")[1] || "png";
};

const pdfImageMimeType = getString("VITE_PDF_IMAGE_MIME_TYPE", "image/png");

export const appConfig = {
    ai: {
        feedbackModel: getString("VITE_AI_FEEDBACK_MODEL", "gpt-5.4-nano"),
    },
    pdf: {
        workerSrc: getString("VITE_PDF_WORKER_SRC", "/pdf.worker.min.mjs"),
        renderScale: getNumber("VITE_PDF_RENDER_SCALE", 4, { min: 0.1 }),
        imageMimeType: pdfImageMimeType,
        imageExtension: getString(
            "VITE_PDF_IMAGE_EXTENSION",
            defaultImageExtension(pdfImageMimeType)
        ),
        imageQuality: getNumber("VITE_PDF_IMAGE_QUALITY", 1, { min: 0, max: 1 }),
    },
    puter: {
        scriptSrc: getString("VITE_PUTER_SCRIPT_SRC", "https://js.puter.com/v2/"),
        initPollMs: getNumber("VITE_PUTER_INIT_POLL_MS", 100, { min: 1 }),
        initTimeoutMs: getNumber("VITE_PUTER_INIT_TIMEOUT_MS", 10000, { min: 1 }),
    },
    storage: {
        resumeKeyPrefix: getString("VITE_RESUME_KV_PREFIX", "resume"),
    },
} as const;

export const getResumeKey = (id: string): string =>
    `${appConfig.storage.resumeKeyPrefix}:${id}`;

export const getResumeListPattern = (): string =>
    `${appConfig.storage.resumeKeyPrefix}:*`;
