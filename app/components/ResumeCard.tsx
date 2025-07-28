import { Link} from "react-router";
import { useEffect, useState } from "react";
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            const response = await fetch(imagePath);
            if (!response.ok) return;
            const blob = await response.blob();
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-200">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000 relative overflow-hidden rounded-xl">
                    <img
                        src={resumeUrl}
                        alt="resume"
                        className="w-full h-[350px] max-sm:h-[200px] object-cover object-top transition-all duration-300 ease-in-out"
                    />
                </div>
                )}
        </Link>
    )
}
export default ResumeCard
