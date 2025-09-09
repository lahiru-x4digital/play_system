import api from "@/services/api";
import React, { useEffect, useState } from "react";

const renderStars = (rating) => {
  const emojiMap = {
    1: '😠 Very dissatisfied',
    2: '🙁 Dissatisfied',
    3: '😐 Neutral',
    4: '🙂 Satisfied',
    5: '😃 Very satisfied',
  };
  return emojiMap[rating] || 'Not Rated';
};

export default function FeedbackDetails({ id }) {
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await api.get(`customer/feedback/${id}`);
        if (data?.data?.data) {
          setFeedback(data.data.data);
        } else {
          setError("No feedback found with this ID");
        }
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        setError("Failed to load feedback details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchFeedback();
  }, [id]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[90vh] shadow">
      {isLoading && (
        <div className="text-gray-500 italic">Loading feedback...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {feedback && (
        <div className="space-y-4">
          {/* Header */}
          <div className="border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Feedback Details
            </h2>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Feedback ID" value={feedback.id} />
            <InfoRow label="Token" value={feedback.token} />
            {feedback.pos_event_id && (
              <InfoRow label="POS Event ID" value={feedback.pos_event_id} />
            )}
            {feedback.club_event_id && (
              <InfoRow label="Club Event ID" value={feedback.club_event_id} />
            )}
          </div>

          {/* Rating */}
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <span className="block text-sm font-medium text-gray-500 mb-1">
              Rating
            </span>
            <span className="text-lg">{renderStars(feedback.stars)}</span>
          </div>

          {/* Feedback message */}
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <span className="block text-sm font-medium text-gray-500 mb-1">
              Feedback Message
            </span>
            <span
              className={`text-sm ${
                feedback.feedback ? "text-gray-800" : "text-gray-400 italic"
              }`}
            >
              {feedback.feedback || "No Feedback"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="block text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
