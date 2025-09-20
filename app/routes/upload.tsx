import { type FormEvent, useState } from "react";
import { usePuterStore } from "../lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "../lib/pdf2img";
import { generateUUID } from "../lib/utils";
import { prepareInstructions } from "../../constants";
import FileUploader from "../components/FileUploader";
import Layout from "../components/Layout";

export const meta = () => ([
    { title: "ResuMatch AI | Resume Upload" },
    { name: "description", content: "Upload your resume" },
]);

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setError(null);
    };

    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file,
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        try {
            setIsProcessing(true);
            setError(null);

            setStatusText("Uploading the file...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) throw new Error("Failed to upload file");

            setStatusText("Converting to image...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) throw new Error("Failed to convert PDF to image");

            setStatusText("Uploading the image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) throw new Error("Failed to upload image");

            setStatusText("Preparing data...");
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: "",
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText("Analyzing...");
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            if (!feedback) throw new Error("Failed to analyze resume");

            const feedbackText =
                typeof feedback.message.content === "string"
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err: any) {
            setError(err.message || "Unexpected error occurred");
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        if (!file) {
            setError("Please upload a resume before continuing.");
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <Layout>
            <div className="page-heading">
                <h1 className="text-gradient">Smart feedback for your dream job</h1>
                <h2
                    className="mt-2 text-lg font-medium"
                    role="status"
                    aria-live="polite"
                >
                    {isProcessing ? statusText : "Drop your resume for an ATS score and improvement tips"}
                </h2>

                {error && (
                    <p className="mt-3 text-red-600 text-sm" role="alert">
                        {error}
                    </p>
                )}
                { isProcessing ? (
                    <div className="flex flex-col items-center justify-center mt-10 gap-4">
                        <img
                            src="/images/resume-scan-2.gif"
                            alt="Scanning resume animation"
                            className="w-[400px]"
                        />
                        <p className="text-gray-600">This may take a few moments. Please do not close or refresh the app.</p>
                    </div>
                    ): (
                    <form
                        id="upload-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 mt-8"
                        aria-busy={isProcessing}
                    >
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input
                                type="text"
                                name="company-name"
                                id="company-name"
                                placeholder="Enter company name"
                                required
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input
                                type="text"
                                name="job-title"
                                id="job-title"
                                placeholder="Enter job title"
                                required
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea
                                rows={5}
                                name="job-description"
                                id="job-description"
                                placeholder="Enter job description"
                                required
                            />
                        </div>
                        <div className="form-div">
                            <label htmlFor="resume-file">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>
                        <button
                            className="primary-button w-full text-xl disabled:opacity-50"
                            type="submit"
                            disabled={isProcessing || !file}
                        >
                            {isProcessing ? "Processing..." : "Analyze Resume"}
                        </button>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default Upload;
