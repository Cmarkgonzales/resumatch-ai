import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { usePuterStore } from "../lib/puter";

const WipeApp = () => {
    const { auth, isAuthenticating, error, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isWiping, setIsWiping] = useState(false);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isAuthenticating && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isAuthenticating]);

    const handleDelete = async () => {
        setIsWiping(true);
        for (const file of files) {
            await fs.delete(file.path);
        }
        await kv.flush();
        await loadFiles();
        setShowConfirm(false);
        setIsWiping(false);
    };

    if (isAuthenticating) return <div className="flex align-center justify-center mt-5 font-semibold text-black text-2xl">Navigating...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <h1 className="text-2xl font-bold mb-4">Wipe App Data</h1>

            <p className="mb-2 text-gray-700">
                Authenticated as: <strong>{auth.user?.username}</strong>
            </p>

            <div className="mb-6">
                <h2 className="text-lg font-semibold">Existing Files:</h2>
                <div className="mt-2 space-y-2">
                    {files.map((file) => (
                        <div key={file.id} className="bg-gray-100 p-2 rounded">
                            {file.name}
                        </div>
                    ))}
                    {files.length === 0 && (
                        <p className="text-gray-500">No files found.</p>
                    )}
                </div>
            </div>

            <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition cursor-pointer"
                onClick={() => setShowConfirm(true)}
                disabled={isWiping}
            >
                {isWiping ? "Wiping..." : "Wipe All Data"}
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                        <p className="text-gray-700 mb-6">
                            This action will permanently delete all stored files and data.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                onClick={() => setShowConfirm(false)}
                                disabled={isWiping}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                onClick={handleDelete}
                                disabled={isWiping}
                            >
                                {isWiping ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WipeApp;
