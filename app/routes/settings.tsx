import { usePuterStore } from "../lib/puter";
import { useNavigate } from "react-router";

export default function Settings() {
    const { auth } = usePuterStore();
    const navigate = useNavigate();

    const handleWipeData = async () => {
        navigate("/wipe");
    };

    return (
        <div className="min-h-full bg-bg-secondary p-6 space-y-6">
            <section className="main-section">
                <div className="page-heading">
                    <h1 className="text-2xl font-bold">Settings</h1>

                    <div className="bg-white w-full p-4 rounded-lg shadow">
                        <h2 className="font-semibold mb-2">Account Settings</h2>
                        <p><strong>Name:</strong> {auth.user?.username ?? "N/A"}</p>
                    </div>

                    <div className="bg-white w-full p-4 rounded-lg shadow">
                        <h2 className="font-semibold mb-2">Data Management</h2>
                        <button
                            onClick={handleWipeData}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Wipe All Data
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
