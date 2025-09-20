import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatSize } from '../lib/utils';
import { X, CloudUpload, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selectedFile = acceptedFiles[0] || null;
            setFile(selectedFile);
            setError(null);
            onFileSelect?.(selectedFile);
        },
        [onFileSelect]
    );

    const {getRootProps, getInputProps, isDragActive, fileRejections,} = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxFileSize,
    });

    // If dropzone rejects, set error
    if (fileRejections.length > 0 && !error) {
        const rejection = fileRejections[0];
        if (rejection.errors.some((e) => e.code === "file-invalid-type")) {
            setError("Invalid file type. Only PDF files are allowed.");
        } else if (rejection.errors.some((e) => e.code === "file-too-large")) {
            setError(`File is too large. Max allowed size is ${formatSize(maxFileSize)}.`);
        } else {
            setError("Failed to upload file. Please try again.");
        }
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        onFileSelect?.(null);
    };

    return (
        <div className="w-full gradient-border transition-all duration-300">
            <div
                {...getRootProps({ tabIndex: 0 })}
                className={`p-6 border-2 rounded-lg transition ${
                    isDragActive ? "border-light-blue-200 bg-purple-50" : "border-border bg-bg-secondary"
                }`}
                role="button"
            >
                <input {...getInputProps()} aria-label="Upload your resume in PDF format"/>

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt={`${file.name} PDF file`} className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="p-2 cursor-pointer rounded-full hover:bg-gray-100"
                                onClick={handleRemove}
                                aria-label="Remove file"
                            >
                                <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
                            </button>
                        </div>
                    ): (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <div className="w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center">
                                    <CloudUpload className="w-10 h-10 text-gray-50" aria-hidden="true" />
                                </div>
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                        </div>
                    )}
                </div>
                {error && (
                    <div
                        className="mt-3 flex justify-center items-center gap-2 text-red-600 text-sm"
                        role="alert"
                        aria-live="polite"
                    >
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
export default FileUploader
