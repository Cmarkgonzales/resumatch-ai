import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle, CheckCircle2, CloudUpload, FileText, X } from "lucide-react";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const maxFileSize = 20 * 1024 * 1024;

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selectedFile = acceptedFiles[0] || null;
            setFile(selectedFile);
            setError(null);
            onFileSelect?.(selectedFile);
        },
        [onFileSelect]
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
    } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "application/pdf": [".pdf"] },
        maxSize: maxFileSize,
    });

    useEffect(() => {
        if (fileRejections.length === 0) return;

        const rejection = fileRejections[0];
        if (rejection.errors.some((e) => e.code === "file-invalid-type")) {
            setError("Upload a PDF file so the resume preview can be analyzed.");
            return;
        }
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
            setError(`Keep the PDF under ${formatSize(maxFileSize)}.`);
            return;
        }

        setError("The file could not be added. Try a different PDF.");
    }, [fileRejections]);

    const handleRemove = (e: MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setError(null);
        onFileSelect?.(null);
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps({ tabIndex: 0 })}
                className={`group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed bg-white p-6 text-center shadow-sm transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDragReject
                        ? "border-red-300 bg-red-50"
                        : isDragActive
                            ? "border-primary bg-indigo-50"
                            : file
                                ? "border-green-200 bg-green-50/40"
                                : "border-indigo-200 hover:border-primary hover:bg-bg-secondary"
                }`}
                role="button"
                aria-label="Upload your resume in PDF format"
            >
                <input {...getInputProps()} aria-label="Upload your resume in PDF format" />

                {file ? (
                    <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:text-left">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] bg-white shadow-sm ring-1 ring-green-100">
                            <img src="/images/pdf.png" alt="" className="h-10 w-10" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Ready to analyze
                            </div>
                            <p className="truncate text-base font-bold text-text-primary">{file.name}</p>
                            <p className="text-sm text-text-secondary">{formatSize(file.size)}</p>
                        </div>
                        <button
                            className="flex min-h-11 min-w-11 items-center justify-center rounded-[8px] text-text-secondary transition hover:bg-white hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            onClick={handleRemove}
                            aria-label="Remove selected file"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <div className="flex max-w-md flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white shadow-lg shadow-indigo-100 transition group-hover:scale-105">
                            <CloudUpload className="h-8 w-8" aria-hidden="true" />
                        </div>
                        <p className="text-lg font-bold text-text-primary">
                            Drop your resume here
                        </p>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            Click to browse or drag in a PDF. We use the first page for the preview and the full file for analysis.
                        </p>
                        <div className="mt-4 flex items-center gap-2 rounded-full bg-bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            PDF up to {formatSize(maxFileSize)}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div
                    className="mt-3 flex items-start gap-2 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                    aria-live="polite"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
