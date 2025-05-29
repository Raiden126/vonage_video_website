import React, { useState } from "react";

const LeaveMeetingModal = ({
  isOpen,
  onClose,
  onConfirm,
  isHost,
  participants,
  getInitials,
  onTransferHost,
}) => {
  const [selectedNewHost, setSelectedNewHost] = useState("");

  if (!isOpen) return null;

  const otherParticipants = participants.filter((p) => !p.isLocal);
  const hasOtherParticipants = otherParticipants.length > 0;

  const handleConfirm = () => {
    if (isHost && hasOtherParticipants && selectedNewHost) {
      onTransferHost(selectedNewHost);
    }
    onConfirm();
  };

  const canLeave = !isHost || !hasOtherParticipants || selectedNewHost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-white text-lg font-semibold mb-4">
          {isHost ? "Transfer Host & Leave Meeting" : "Leave Meeting"}
        </h3>

        <p className="text-gray-300 mb-6">
          {isHost && hasOtherParticipants
            ? "As the host, you need to select a new host before leaving the meeting."
            : "Are you sure you want to leave the meeting?"}
        </p>

        {isHost && hasOtherParticipants && (
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">
              Select New Host:
            </label>
            <div className="space-y-2">
              {otherParticipants.map((participant) => (
                <label
                  key={participant.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="newHost"
                    value={participant.id}
                    checked={selectedNewHost === participant.id}
                    onChange={(e) => setSelectedNewHost(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(participant.name)}
                    </span>
                  </div>
                  <span className="text-white">{participant.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canLeave}
            className={`px-4 py-2 rounded-lg transition duration-200 ${
              canLeave
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isHost && hasOtherParticipants
              ? "Transfer & Leave"
              : "Leave Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveMeetingModal;
