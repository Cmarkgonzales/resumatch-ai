interface ImportMetaEnv {
    readonly [key: string]: string | boolean | undefined;
    readonly VITE_AI_FEEDBACK_MODEL?: string;
    readonly VITE_PDF_WORKER_SRC?: string;
    readonly VITE_PDF_RENDER_SCALE?: string;
    readonly VITE_PDF_IMAGE_MIME_TYPE?: string;
    readonly VITE_PDF_IMAGE_EXTENSION?: string;
    readonly VITE_PDF_IMAGE_QUALITY?: string;
    readonly VITE_PUTER_SCRIPT_SRC?: string;
    readonly VITE_PUTER_INIT_POLL_MS?: string;
    readonly VITE_PUTER_INIT_TIMEOUT_MS?: string;
    readonly VITE_RESUME_KV_PREFIX?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
