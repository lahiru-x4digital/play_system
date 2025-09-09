import api from "@/services/api";
import React, { useEffect, useState } from "react";

export default function ClubEventDetails({ id }) {
  const [clubEvent, setClubEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchClubEvent = async () => {
      try {
        const data = await api.get(`club-events/${id}`)
        if (data?.data) {
     
          setClubEvent(data.data.data)
    
        } else {
          setError('No club event found with this ID')
        }
      } catch (error) {
        console.error('Failed to fetch club event:', error)
        setError('Failed to load club event details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchClubEvent()
    }
  }, [id])
  return (
    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[90vh] shadow">
    {isLoading && (
      <div className="text-gray-500 italic">Loading POS event...</div>
    )}

    {error && <div className="text-red-500 font-medium">{error}</div>}

    {clubEvent && (
      <pre className="text-sm p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(clubEvent, null, 2)}
      </pre>
    )}
  </div>
  );
}
