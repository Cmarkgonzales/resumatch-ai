import { useState } from "react";
import { AlertTriangle, Trash2, User } from "lucide-react";

const UserSettings = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleWipeData = () => {
    // Example: Clear local storage and reload
    localStorage.clear();
    location.reload();
  };

  return (
    <section className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          <User className="w-7 h-7" />
        </div>
        <div>
          <p className="text-lg font-semibold">John Doe</p>
          <p className="text-sm text-gray-500">johndoe@example.com</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Wipe App Data
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600 w-6 h-6" />
              <h2 className="text-lg font-semibold text-red-600">Confirm Wipe</h2>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to wipe all app data? This action is irreversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeData}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UserSettings;
