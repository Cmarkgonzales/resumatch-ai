import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
    AlertCircle,
    Briefcase,
    Building2,
    CheckCircle2,
    FileCheck2,
    FileText,
    LoaderCircle,
    Sparkles,
} from "lucide-react";
import FileUploader from "../components/FileUploader";
import Layout from "../components/Layout";
import { appConfig, getResumeKey } from "../lib/config";
import { parseFeedbackResponse } from "../lib/feedback";
import { convertPdfToImage, extractPdfText } from "../lib/pdf2img";
import { usePuterStore } from "../lib/puter";
import { generateUUID } from "../lib/utils";
import { prepareInstructions } from "../../constants";

type ResumeDraft = Omit<Resume, "feedback"> & { feedback: Feedback | "" };

export const meta = () => ([
    { title: "ResuMatch AI | Resume Upload" },
    { name: "description", content: "Upload your resume" },
]);

const processingSteps = [
    "Creating preview",
    "Reading resume text",
    "Uploading resume",
    "Preparing analysis",
    "Generating feedback",
];

const Upload = () => {
    const { fs, ai, kv, auth } = usePuterStore();
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const validation = useMemo(() => {
        return {
            companyName: companyName.trim().length >= 2,
            jobTitle: jobTitle.trim().length >= 2,
            jobDescription: jobDescription.trim().length >= 40,
            file: Boolean(file),
        };
    }, [companyName, file, jobDescription, jobTitle]);

    const canSubmit =
        validation.companyName &&
        validation.jobTitle &&
        validation.jobDescription &&
        validation.file &&
        !isProcessing;

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
        setError(null);
    };

    const setProgress = (step: number, text: string) => {
        setCurrentStep(step);
        setStatusText(text);
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Upload a PDF resume before starting the analysis.");
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);

            setProgress(0, "Creating a visual preview...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                throw new Error(imageFile.error || "Failed to convert PDF to preview.");
            }

            setProgress(1, "Reading resume text...");
            const resumeText = await extractPdfText(file);
            if (resumeText.length < 80) {
                throw new Error(
                    "The uploaded PDF does not contain enough readable text for analysis. Export the resume as a text-based PDF instead of a scanned image."
                );
            }
            const promptResumeText = resumeText.slice(0, appConfig.ai.maxResumeTextChars);

            setProgress(2, "Uploading your resume securely...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) throw new Error("Failed to upload resume PDF.");

            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) throw new Error("Failed to upload resume preview.");

            setProgress(3, "Preparing role-specific analysis...");
            const uuid = generateUUID();
            const data: ResumeDraft = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName: companyName.trim(),
                jobTitle: jobTitle.trim(),
                jobDescription: jobDescription.trim(),
                createdAt: new Date().toISOString(),
                feedback: "",
            };
            await kv.set(getResumeKey(uuid), JSON.stringify(data));

            setProgress(4, "Checking Puter monthly usage...");
            const usage = await auth.getMonthlyUsage();
            if (
                typeof usage?.allowanceInfo.remaining === "number" &&
                usage.allowanceInfo.remaining <= 0
            ) {
                throw new Error(
                    "Your Puter monthly usage allowance is exhausted. Clearing saved resume data does not reset Puter usage."
                );
            }

            setProgress(4, "Generating actionable feedback...");
            const feedback = await ai.feedback(
                prepareInstructions({
                    jobTitle: jobTitle.trim(),
                    jobDescription: jobDescription.trim(),
                    resumeText: promptResumeText,
                }),
                imageFile.file
            );
            if (!feedback) throw new Error("Failed to analyze resume.");

            const feedbackText =
                typeof feedback.message.content === "string"
                    ? feedback.message.content
                    : feedback.message.content[0].text;

            data.feedback = parseFeedbackResponse(feedbackText);
            await kv.set(getResumeKey(uuid), JSON.stringify(data));

            setStatusText("Analysis complete. Opening feedback...");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error occurred.");
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!canSubmit) {
            setError("Complete the job details and upload a PDF resume to continue.");
            return;
        }

        handleAnalyze();
    };

    const fieldStatus = (valid: boolean, value: string) => {
        if (!value.trim()) return null;
        return valid ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
        ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
        );
    };

    return (
        <Layout>
            <div className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="mb-3 flex flex-col gap-2 rounded-[8px] border border-indigo-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            Analysis funnel
                        </p>
                        <h1 className="text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                            Add role context and upload your resume.
                        </h1>
                        <p className="mt-1 text-sm leading-5 text-text-secondary">
                            The next cards collect the details needed for ATS scoring and targeted feedback.
                        </p>
                    </div>
                    <div className="flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-[8px] border border-indigo-100 bg-indigo-50 px-3 text-xs font-bold text-primary">
                        <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                        3-step upload
                    </div>
                </section>

                {isProcessing ? (
                    <section className="rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-950">
                                    Analyzing your resume
                                </h2>
                                <p className="mt-2 text-sm text-text-secondary" role="status" aria-live="polite">
                                    {statusText}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 rounded-[8px] bg-primary/10 px-4 py-3 text-primary">
                                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                                <span className="font-bold">Estimated 45-60 sec</span>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                            {processingSteps.map((step, index) => {
                                const isComplete = index < currentStep;
                                const isActive = index === currentStep;
                                return (
                                    <div
                                        key={step}
                                        className={`rounded-[8px] border p-4 ${
                                            isComplete
                                                ? "border-green-100 bg-green-50 text-green-700"
                                                : isActive
                                                    ? "border-indigo-200 bg-indigo-50 text-primary"
                                                    : "border-border bg-slate-50 text-text-secondary"
                                        }`}
                                    >
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                                            {isComplete ? (
                                                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                                            ) : isActive ? (
                                                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                                            ) : (
                                                <span className="text-sm font-black">{index + 1}</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold">{step}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="!grid w-full items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]"
                    >
                        <section className="min-w-0 rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Step 1</p>
                                    <h2 className="text-2xl font-black text-slate-950">
                                        Job details
                                    </h2>
                                    <p className="mt-1 text-sm text-text-secondary">
                                        These fields tailor the scoring to the role you want.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5">
                                <label className="grid gap-2">
                                    <span className="flex items-center justify-between text-sm font-bold text-text-primary">
                                        <span className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                                            Company name
                                        </span>
                                        {fieldStatus(validation.companyName, companyName)}
                                    </span>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Example: Stripe"
                                        required
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="flex items-center justify-between text-sm font-bold text-text-primary">
                                        <span className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" aria-hidden="true" />
                                            Job title
                                        </span>
                                        {fieldStatus(validation.jobTitle, jobTitle)}
                                    </span>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="Example: Product Designer"
                                        required
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="flex items-center justify-between text-sm font-bold text-text-primary">
                                        <span className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                                            Job description
                                        </span>
                                        {fieldStatus(validation.jobDescription, jobDescription)}
                                    </span>
                                    <textarea
                                        rows={8}
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the responsibilities, requirements, and preferred skills from the job post."
                                        required
                                    />
                                    <span className="text-xs text-text-secondary">
                                        {jobDescription.trim().length}/40 characters minimum
                                    </span>
                                </label>
                            </div>
                        </section>

                        <section className="grid min-w-0 gap-5">
                            <div className="rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-5 flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                                        <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Step 2</p>
                                        <h2 className="text-2xl font-black text-slate-950">
                                            Resume upload
                                        </h2>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            Upload a PDF version of the resume you plan to submit.
                                        </p>
                                    </div>
                                </div>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <div className="rounded-[8px] border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
                                <p className="text-sm font-bold text-primary">Step 3</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-950">
                                    Analyze
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-text-secondary">
                                    You will get an ATS score, category scores, and specific edits to improve the resume for this role.
                                </p>

                                {error && (
                                    <div
                                        className="mt-4 flex items-start gap-2 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                        role="alert"
                                    >
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-5 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                    type="submit"
                                    disabled={!canSubmit}
                                >
                                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                                    Analyze Resume
                                </button>
                            </div>
                        </section>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default Upload;
