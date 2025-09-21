import { Link, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { usePuterStore } from "../lib/puter";
import Summary from "../components/Summary";
import ATS from "../components/ATS";
import Details from "../components/Details";
import { ArrowLeft } from "lucide-react";

export const meta = () => ([
    { title: "ResuMatch AI | Resume Feedback" },
    { name: "description", content: "Detailed overview of your resume" },
]);

const Resume = () => {
    const { fs, kv } = usePuterStore();
    const { id } = useParams();
    const [resumeBlob, setResumeBlob] = useState<Blob | null>(null);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const resumeUrl = useMemo(
        () => (resumeBlob ? URL.createObjectURL(resumeBlob) : ""),
        [resumeBlob]
    );
    const imageUrl = useMemo(
        () => (imageBlob ? URL.createObjectURL(imageBlob) : ""),
        [imageBlob]
    );

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);

            const rBlob = await fs.read(data.resumePath);
            if (rBlob) setResumeBlob(new Blob([rBlob], { type: "application/pdf" }));

            const iBlob = await fs.read(data.imagePath);
            if (iBlob) setImageBlob(new Blob([iBlob]));

            setFeedback(data.feedback);
        };

        loadResume();

        return () => {
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [id]);

    return (
        <main className="min-h-screen bg-bg-secondary pb-12">
            <nav className="flex items-center gap-auto p-4 border-b border-border bg-white/70 backdrop-blur-sm sticky top-0 z-40">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back to Home
                </Link>
                <h2 className="items-center text-3xl md:text-4xl font-bold text-gradient ml-auto">
                    Resume Review
                </h2>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section
                    className="h-fit lg:sticky lg:top-24"
                    aria-label="Uploaded Resume Preview"
                >
                    {imageUrl && resumeUrl ? (
                        <div className="gradient-border rounded-xl w-full">
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open full resume"
                                className="block"
                            >
                                <img
                                    src={imageUrl}
                                    alt="Uploaded Resume Preview"
                                    className="w-full object-contain shadow-lg animate-in fade-in duration-700 transition-opacity"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="gradient-border relative overflow-hidden rounded-xl">
                            <div className="w-full h-[90vh] max-sm:h-[200px] bg-gray-200 animate-pulse" />
                        </div>
                    )}
                </section>

                <section className="flex flex-col gap-8">
                    {feedback ? (
                        <div className="animate-in fade-in slide-in-from-right duration-700 flex flex-col gap-8">
                            <Summary feedback={feedback} />
                            <ATS
                                score={feedback.ATS.score || 0}
                                suggestions={feedback.ATS.tips || []}
                            />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <img
                                src="/images/resume-scan-2.gif"
                                alt="Analyzing Resume"
                                className="w-64"
                            />
                            <p className="text-gray-600 mt-4 text-sm">
                                Analyzing your resume... please wait.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
